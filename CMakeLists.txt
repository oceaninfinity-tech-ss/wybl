cmake_minimum_required(VERSION 3.14)

set(PROJECT_NAME sss-guis)

project(${PROJECT_NAME} LANGUAGES CXX VERSION 0.0.0)

set(EXECUTABLE_NAME ${PROJECT_NAME}_executable)
set(LIBRARY_NAME ${PROJECT_NAME}_library)

set(CMAKE_SKIP_BUILD_RPATH FALSE)

find_package(yaml-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(SOURCES src/dependencies.cpp
            src/generation.cpp
            src/guis.cpp
            src/structure.cpp)

option(BUILD_AS_SHARED_LIBRARY "Build as shared library" OFF)
option(BUILD_AS_STATIC_LIBRARY "Build as static library" OFF)
option(BUILD_EXECUTABLE "Build an executable" ON)

if (BUILD_EXECUTABLE)
    if (NOT(BUILD_AS_SHARED_LIBRARY OR BUILD_AS_STATIC_LIBRARY))
        set(BUILD_AS_SHARED_LIBRARY ON)
        message("-- No library type was defined so defaulting to a shared library")
    endif()
endif()

if (BUILD_AS_SHARED_LIBRARY)
    message("-- Building ${PROJECT_NAME} as a shared library")
    add_library(${LIBRARY_NAME} SHARED ${SOURCES})
elseif (BUILD_AS_STATIC_LIBRARY)
    message("-- Building ${PROJECT_NAME} as a static library")
    add_library(${LIBRARY_NAME} STATIC ${SOURCES})
elseif (NOT(BUILD_EXECUTABLE))
    message(FATAL_ERROR "Nothing is configured to be build for ${PROJECT_NAME}")
endif()

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

target_link_libraries(${LIBRARY_NAME} PRIVATE yaml-cpp nlohmann_json::nlohmann_json)

target_compile_options(${LIBRARY_NAME} PRIVATE -Wall
                                               -Wextra
                                               -Wpedantic
                                               -Werror
                                               -s
                                               -O3)

set_target_properties(${LIBRARY_NAME} PROPERTIES OUTPUT_NAME ${PROJECT_NAME})

if (BUILD_EXECUTABLE)
    message("   Building ${PROJECT_NAME} as an executable (as well)")
    add_executable(${EXECUTABLE_NAME} main.cpp)
    target_link_libraries(${EXECUTABLE_NAME} PRIVATE ${LIBRARY_NAME})
    target_compile_definitions(${EXECUTABLE_NAME} PRIVATE
                               SSS_GUIS_VERSION_MAJOR=${sss-guis_VERSION_MAJOR}
                               SSS_GUIS_VERSION_MINOR=${sss-guis_VERSION_MINOR}
                               SSS_GUIS_VERSION_PATCH=${sss-guis_VERSION_PATCH}
    )
    set_target_properties(${EXECUTABLE_NAME} PROPERTIES OUTPUT_NAME ${PROJECT_NAME})
endif()
