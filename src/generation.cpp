#include "dependencies.hpp"
#include "generation.hpp"
#include "guis.js.hpp" // Generated file
#include "structure.hpp"

#include <algorithm>
#include <filesystem>
#include <fstream>
#include <future>
#include <iostream>
#include <mutex>
#include <nlohmann/json.hpp>
#include <streambuf>
#include <thread>

using namespace sss::guis;

namespace
{
    /**
     * @brief Checks if a filepath is a descendant of another filepath
     * @param parent Filepath
     * @param child Filepath
     * @returns If the child path is a descendant of the parent
     */
    bool is_descendant(std::filesystem::path const &parent, std::filesystem::path const &child)
    {
        // If paths are identical, child is not a descendant of itself
        if (parent == child)
            return false;

        auto parent_it = parent.begin();
        auto child_it = child.begin();

        // Iterate through path components
        while (parent_it != parent.end() && child_it != child.end())
        {
            if (*parent_it != *child_it)
                return false; // Components don't match, not a descendant
            ++parent_it;
            ++child_it;
        }
        // If the parent iterator has reached its end but the child iterator has not
        return (parent_it == parent.end() && child_it != child.end());
    }

    /**
     * @brief Removes any filepaths that are descendants of any filepaths in a vector
     * @param paths A vector of filepaths
     * @returns A vector of filepaths with descendant filepaths removed
     */
    std::vector<std::filesystem::path> const removeDescendantPaths(std::vector<std::filesystem::path> &paths)
    {
        // Sort the paths to ensure parent paths come before their descendants
        std::sort(paths.begin(), paths.end());

        std::vector<std::filesystem::path> unique_paths = {};
        if (paths.empty())
            return unique_paths;

        unique_paths.push_back(paths[0]); // Add the first path as it's the most "parental" initially

        for (auto const &path : paths)
        {
            if (std::find(unique_paths.begin(), unique_paths.end(), path) != unique_paths.end())
                continue;
            // Check if the current path is a descendant of the last unique path found
            if (!is_descendant(unique_paths.back(), path))
                unique_paths.push_back(path); // Keep if not a descendant
        }
        return unique_paths;
    }

    /**
     * @brief Convert a relative filepath to an absolute filepath
     * @param target_path The filepath to make absolute against `base_path`
     * @param base_path The base filepath to perform evaluation against
     * @return Absolute filepath
     */
    std::filesystem::path convert_relative_path_to_absolute(std::filesystem::path const &target_path, std::filesystem::path const &base_path)
    {
        std::filesystem::path base_directory = std::filesystem::absolute(base_path).parent_path();
        std::filesystem::path absolute_target_path;
        if (target_path.is_absolute())
            absolute_target_path = target_path;
        else
            absolute_target_path = base_directory / target_path;
        return std::filesystem::absolute(base_directory / std::filesystem::relative(absolute_target_path, base_directory)).lexically_normal();
    }

    /**
     * @brief Get a filepath relative to another
     * @param target_path The filepath to make absolute against `base_path`
     * @param base_path The base filepath to perform evaluation against
     * @return Relative filepath
     */
    std::filesystem::path convert_absolute_path_to_relative(std::filesystem::path const &target_path, std::filesystem::path const &base_path)
    {
        return std::filesystem::relative(std::filesystem::absolute(target_path), base_path);
    }
}

generation_t::generation_t(std::filesystem::path const &configuration_file, std::filesystem::path const &output_directory)
    : m_guis({}),
      m_dependencies({}),
      m_configuration_directory(std::filesystem::absolute(configuration_file.lexically_normal()).parent_path()),
      m_output_directory(std::filesystem::absolute(output_directory.lexically_normal()))
{
    YAML::Node config;
    try
    {
        config = YAML::LoadFile(configuration_file.string());
    }
    catch (const YAML::Exception &e)
    {
        throw std::runtime_error("Failed to load descriptive YAML file `" + configuration_file.string() + "`");
    }

    if (!config["guis"].IsDefined() || !config["guis"].IsSequence())
        throw std::runtime_error("Expected list of `guis` in configuration");

    for (const YAML::Node &gui_node : config["guis"])
    {
        gui_t current_gui_data;

        // Check whether core configuration strings are present
        for (std::string const field : {"name", "config", "stylesheet"})
        {
            if (!gui_node[field].IsDefined())
                throw std::runtime_error("Required field of `" + field + "` is missing");
            if (gui_node[field].IsScalar())
            {
                try
                {
                    gui_node[field].as<std::string>();
                    continue;
                }
                catch (const YAML::BadConversion &e)
                {
                }
            }
            throw std::runtime_error("Unable to parse required field of `" + field + "` since a string is expected");
        }

        // Store name of GUI
        current_gui_data.name = gui_node["name"].as<std::string>();

        // Store configuration filepath of GUI
        current_gui_data.source_configuration_file = gui_node["config"].as<std::string>();
        current_gui_data.source_configuration_file = convert_relative_path_to_absolute(current_gui_data.source_configuration_file, configuration_file).string();
        if (current_gui_data.source_configuration_file.empty() || !std::filesystem::exists(current_gui_data.source_configuration_file))
            throw std::runtime_error("Unable to find a source config file of `" + current_gui_data.source_configuration_file + "`");

        // Store stylesheet filepath of GUI
        current_gui_data.stylesheet_file = convert_relative_path_to_absolute(gui_node["stylesheet"].as<std::string>(), configuration_file);
        std::filesystem::path stylesheet_path = std::filesystem::absolute(current_gui_data.stylesheet_file);
        if (!std::filesystem::exists(stylesheet_path.string()))
            throw std::runtime_error("Unable to find the stylesheet `" + current_gui_data.stylesheet_file + "`");
        current_gui_data.stylesheet_file = convert_absolute_path_to_relative(stylesheet_path, m_configuration_directory);
        m_dependencies[stylesheet_path] = current_gui_data.stylesheet_file;

        // Set html filepath of GUI
        current_gui_data.html_file = current_gui_data.name + ".html";
        if (std::filesystem::exists(m_output_directory / current_gui_data.html_file))
            throw std::runtime_error("Unable to generate source for `" + current_gui_data.html_file + "` as a file already exists with that name");

        // Store debug state of GUI
        current_gui_data.debug = false;
        if (gui_node["debug"].IsDefined())
        {
            do
            {
                if (gui_node["debug"].IsScalar())
                {
                    try
                    {
                        current_gui_data.debug = gui_node["debug"].as<bool>(false);
                        continue;
                    }
                    catch (const std::exception &e)
                    {
                    }
                }
                throw std::runtime_error("Unable to parse `debug` since a boolean value is expected");
            } while (false);
        }

        // Check whether dependencies are listed
        if (!gui_node["dependencies"].IsDefined())
        {
            // Expect a list of dependencies
            if (gui_node["dependencies"].IsSequence())
            {
                // Get the directory of the file being processed
                for (const YAML::Node &dep_node : gui_node["dependencies"])
                {
                    if (!dep_node.IsScalar())
                        throw std::runtime_error("Expected a string path for a dependency in `" + configuration_file.string() + "`");

                    // Convert the dependency string to a std::filesystem::path object
                    std::string dependency_path;
                    try
                    {
                        std::string dependency_path = convert_relative_path_to_absolute(dep_node.as<std::string>(), configuration_file);
                    }
                    catch (const YAML::BadConversion &e)
                    {
                        throw std::runtime_error("Expected a string path for a dependency in `" + configuration_file.string() + "`");
                    }
                    try
                    {
                        for (auto &&dependency : dependencies_t(dependency_path).paths())
                            m_dependencies[dependency.lexically_relative(m_configuration_directory)] = convert_absolute_path_to_relative(dependency, m_configuration_directory);
                    }
                    catch (const std::exception &e)
                    {
                        throw std::runtime_error("No file(s) exists for dependency `" + dependency_path + "` within the configuration directory.");
                    }
                }
            }
            else if (gui_node["dependencies"].Type() != YAML::NodeType::Null)
                throw std::runtime_error("Unable to parse `dependencies` since a list is expected");
        }
        m_guis.push_back(current_gui_data); // Add to the collection
    }
    if (!std::filesystem::exists(m_output_directory))
    {
        if (!std::filesystem::create_directories(m_output_directory))
            throw std::runtime_error("Failed to create output directory");
    }
    else if (!std::filesystem::is_directory(m_output_directory))
        throw std::runtime_error("There is already a file located as the output directory location");
}

generation_t::~generation_t()
{
    m_guis.clear();
    m_dependencies.clear();
}

void generation_t::generate(generation_t::gui_t const &data, std::string const &guis_js_path, std::ostream const *debug_stream)
{
    std::string structure;
    try
    {
        // Generate structure
        structure = structure_t(data.source_configuration_file, data.name, debug_stream).build(!data.debug);
    }
    catch (const std::exception &e)
    {
        throw std::runtime_error(data.name + ": " + e.what());
    }

    // Structure output filepath
    std::string const structure_file = unique_filename("json");

    // GUI JSON object
    nlohmann::json gui_info = {
        {"name", data.name},
        {"structure", "/" + structure_file},
        {"stylesheet", data.stylesheet_file},
    };

    // Generate HTML
    std::string html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>SSS</title><script type=\"text/javascript\">const gui=" + gui_info.dump() + ";</script><script type=\"text/javascript\" src=\"/" + guis_js_path + "\"></script></head><body></body></html>";

    /**
     * @brief Write contents to a file
     * @param filepath The location of the file to write to
     * @param contents The contents of the file to be written
     */
    std::function<void(std::string, std::string)> write_file = [](std::string const &filepath, std::string const &content) -> void
    {
        std::ofstream file(filepath);
        if (!file)
            throw std::runtime_error("Failed to open file for writing: " + filepath);
        file << content;
    };

    // Write output files
    write_file((m_output_directory / data.html_file).string(), html);
    write_file((m_output_directory / structure_file).string(), structure);
}

std::filesystem::path generation_t::unique_filename(std::string const &extension)
{
    static std::mutex unique_filename_mutex;
    std::lock_guard<std::mutex> lock(unique_filename_mutex);

    static bool seeded = false;
    if (!seeded)
    {
        std::srand(static_cast<unsigned int>(std::time(0)));
        seeded = true;
    }
    while (true)
    {
        std::string filename = std::to_string(std::rand()) + '.' + extension;
        bool unique = true;
        for (auto &&dependency : m_dependencies)
        {
            if (filename == dependency.second.filename())
            {
                unique = false;
                break;
            }
        }
        if (unique)
            return filename;
    }
}

void generation_t::build_all(bool const disallow_conflicts, bool const flatten_dependency_references, std::ostream const *debug_stream)
{
    std::filesystem::copy_options copy_options = std::filesystem::copy_options::recursive;
    if (disallow_conflicts)
    {
        copy_options |= std::filesystem::copy_options::overwrite_existing;
        // Check if output dependencies will conflict with generated files
        std::vector<std::filesystem::path> dependency_filenames = {};
        for (auto const &dependency : m_dependencies)
        {
            std::filesystem::path const dependency_source = dependency.first;
            std::filesystem::path const dependency_destination = dependency.second;
            dependency_filenames.push_back(dependency.first.filename());
            for (auto const &gui_data : m_guis)
            {
                for (auto const &generated_file : {gui_data.html_file, gui_data.structure_file})
                {
                    if (flatten_dependency_references)
                    {
                        if (generated_file != dependency_destination.filename())
                            continue;
                    }
                    else if (generated_file != dependency_destination)
                        continue;
                    throw std::runtime_error("A dependency of `" + dependency_destination.string() + "` will conflict with an automatically generated file");
                }
            }
            bool conflict = false;
            if (flatten_dependency_references)
                conflict = std::filesystem::exists(m_output_directory / dependency_destination.filename());
            else
                conflict = std::filesystem::exists(m_output_directory / dependency_destination);
            if (conflict)
                throw std::runtime_error("A dependency of `" + dependency_source.string() + "` will conflict with an already existing file");
        }
        if (flatten_dependency_references)
        {
            // Sort dependency filenames for faster finding...
            std::sort(dependency_filenames.begin(), dependency_filenames.end(), [](const std::filesystem::path &a, const std::filesystem::path &b)
            { return a.filename().string() < b.filename().string(); });

            //Check if output dependencies will conflict with each other when filenames are flattened
            auto duplicate = std::adjacent_find(dependency_filenames.begin(), dependency_filenames.end(), [](const std::filesystem::path &a, const std::filesystem::path &b)
                                                { return a.filename().string() == b.filename().string(); });
            if (duplicate != dependency_filenames.end())
                throw std::runtime_error("Conflicting filename of `" + duplicate->filename().string() + "` between flattened dependencies");
            // Flatten output stylesheet paths
            for (auto &&gui : m_guis)
                gui.stylesheet_file = std::filesystem::path(gui.stylesheet_file).filename().string();
        }
    }

    { // Remove sub dependencies
        std::vector<std::filesystem::path> dependencies_keys = {};
        for (auto &dependency : m_dependencies)
            dependencies_keys.push_back(dependency.first);

        std::vector<std::filesystem::path> dependenciesAllowed = removeDescendantPaths(dependencies_keys);
        std::vector<std::filesystem::path> dependenciesDisallowed = {};
        for (auto &&dependency : m_dependencies)
        {
            if (std::find(dependenciesAllowed.begin(), dependenciesAllowed.end(), dependency.first) == dependenciesAllowed.end())
                dependenciesDisallowed.push_back(dependency.first);
        }
        for (auto &disallowedDependency : dependenciesDisallowed)
            m_dependencies.erase(disallowedDependency);
    }

    // Write GUI JavaScript file
    std::string guis_js_filename = unique_filename("js");
    std::ofstream guis_js_stream(m_output_directory / guis_js_filename, std::ios::binary | std::ios::out);
    if (!guis_js_stream.is_open())
        throw std::runtime_error("Failed to create a file for writing output content to");
    guis_js_stream.write(reinterpret_cast<const char *>(sss_guis_js), sss_guis_js_len);
    guis_js_stream.close();

    // Parallel processing loop
    std::vector<std::future<void>> futures;
    for (const auto &gui_data : m_guis)
        futures.push_back(std::async(std::launch::async, [this, gui_data, guis_js_filename, debug_stream]()
                                     { generate(gui_data, guis_js_filename, debug_stream); })); // Launch asynchronously

    // Wait for all threads to complete
    for (auto &future : futures)
        future.get(); // Blocks until the task completes and propagates exceptions

    // Copy dependencies
    for (auto const &dependency : m_dependencies)
    {
        std::filesystem::path const dependency_source = dependency.first;
        std::filesystem::path const dependency_destination = dependency.second;

        if (flatten_dependency_references)
            std::filesystem::copy((m_configuration_directory / dependency_source), (m_output_directory / dependency_destination.filename()), copy_options);
        else
        {
            std::filesystem::create_directories(m_output_directory / dependency_destination.parent_path());
            std::filesystem::copy((m_configuration_directory / dependency_source), (m_output_directory / dependency_destination), copy_options);
        }
    }
    return;
}
