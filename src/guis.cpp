#include "guis.hpp"
#include "generation.hpp"

using namespace sss::guis;

guis_t::guis_t(std::filesystem::path const &configuration_file, std::filesystem::path const &m_output_directory)
    : m_configuration_directory(configuration_file),
      m_output_directory(m_output_directory)
{
}

guis_t::~guis_t()
{
}

void guis_t::generate(bool const disallow_conflicts, bool const flatten_dependency_references, std::ostream const *debug_stream)
{
    generation_t(m_configuration_directory, m_output_directory).build_all(disallow_conflicts, flatten_dependency_references, debug_stream);
}
