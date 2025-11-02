cmake_minimum_required(VERSION 3.14)

set(PROJECT_NAME sss-guis-js)

project(${PROJECT_NAME} LANGUAGES CXX)

set(WORKING_DIRECTORY_LOCATION ${CMAKE_CURRENT_BINARY_DIR}/js-gen)

file(MAKE_DIRECTORY "${WORKING_DIRECTORY_LOCATION}")
set(SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
file(GLOB_RECURSE FILES_TO_MONITOR "${SOURCE_DIR}/*")
set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS ${FILES_TO_MONITOR})
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/CMakeLists.txt" # A dummy input file
    "${CMAKE_CURRENT_BINARY_DIR}/.reconfigure_trigger"
    COPYONLY
)

foreach(file_path ${FILES_TO_MONITOR})
    string(FIND "${file_path}" "${SOURCE_DIR}/" is_prefix)
    if (is_prefix EQUAL 0)
        file(RELATIVE_PATH relative_file_path "${SOURCE_DIR}" "${file_path}")
        set(full_destination_path "${WORKING_DIRECTORY_LOCATION}/${relative_file_path}")
        get_filename_component(destination_dir "${full_destination_path}" DIRECTORY)
        file(MAKE_DIRECTORY "${destination_dir}")
        file(COPY "${file_path}" DESTINATION "${destination_dir}")
    endif()
endforeach()

message("-- Fetching: npm dependencies")
execute_process(COMMAND npm i
                WORKING_DIRECTORY "${WORKING_DIRECTORY_LOCATION}")

set(GENERATED_JS "${WORKING_DIRECTORY_LOCATION}/dist/guis.js")
set(GENERATED_INCLUDE_DIRECTORY "${WORKING_DIRECTORY_LOCATION}/dist/include")
set(GENERATED_HEADER "${GENERATED_INCLUDE_DIRECTORY}/guis.js.hpp")

add_custom_command(COMMAND npm run build
                   OUTPUT ${GENERATED_JS}
                   COMMENT "Generating sss-guis JavaScript bundle"
                   WORKING_DIRECTORY "${WORKING_DIRECTORY_LOCATION}")
add_custom_command(COMMAND ${CMAKE_COMMAND} -E make_directory "${GENERATED_INCLUDE_DIRECTORY}/"
                   COMMAND xxd -i -n "${PROJECT_NAME}" "${GENERATED_JS}" > "${GENERATED_HEADER}"
                   OUTPUT ${GENERATED_HEADER}
                   WORKING_DIRECTORY "${WORKING_DIRECTORY_LOCATION}"
                   COMMENT "Converting sss-guis JavaScript bundle into embeddable string"
                   DEPENDS "${GENERATED_JS}")

add_library(${PROJECT_NAME} INTERFACE ${GENERATED_HEADER})

set(SSS-GUIS-JS-HEADER ${GENERATED_INCLUDE_DIRECTORY} PARENT_SCOPE)
