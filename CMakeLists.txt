cmake_minimum_required(VERSION 3.14)

set(PROJECT_NAME sss-guis)

project(${PROJECT_NAME} LANGUAGES CXX VERSION 0.0.0)

set(LIBRARY_NAME ${PROJECT_NAME}_library)

set(CMAKE_SKIP_BUILD_RPATH FALSE)

find_package(yaml-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(SOURCES src/dependencies.cpp
            src/generation.cpp
            src/structure.cpp)

option(BUILD_AS_SHARED_LIBRARY "Build as shared library" ON)
option(BUILD_AS_STATIC_LIBRARY "Build as static library" OFF)

if (BUILD_AS_SHARED_LIBRARY)
    message("-- Building ${PROJECT_NAME} as a shared library")
    add_library(${LIBRARY_NAME} SHARED ${SOURCES})
elseif (BUILD_AS_STATIC_LIBRARY)
    message("-- Building ${PROJECT_NAME} as a static library")
    add_library(${LIBRARY_NAME} STATIC ${SOURCES})
endif(BUILD_AS_SHARED_LIBRARY)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

target_link_libraries(${LIBRARY_NAME} PRIVATE yaml-cpp nlohmann_json::nlohmann_json)

target_compile_options(${LIBRARY_NAME} PRIVATE -Wall
                                               -Wextra
                                               -Wpedantic
                                               -Werror
                                               -s
                                               -O3)

set_target_properties(${LIBRARY_NAME} PROPERTIES OUTPUT_NAME ${PROJECT_NAME})
