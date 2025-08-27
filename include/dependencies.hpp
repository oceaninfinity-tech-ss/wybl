#pragma once

#include <filesystem>
#include <vector>

namespace sss::guis
{
    class dependencies_t
    {
    private:
        /**
         * @brief The path to evaluate against
         */
        std::filesystem::path const m_path;

    public:
        /**
         * @brief Construct a dependency tree
         * @param path The path to evaluate (support * and ? wildcards)
         */
        dependencies_t(std::filesystem::path const &path);
        /**
         * @brief Deconstructor
         */
        ~dependencies_t();
        /**
         * @brief Show all evaluated paths
         * @returns A vector of all matching (existing) paths
         */
        std::vector<std::filesystem::path> paths();
    };
}
