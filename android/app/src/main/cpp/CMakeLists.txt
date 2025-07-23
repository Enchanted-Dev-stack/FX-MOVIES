cmake_minimum_required(VERSION 3.13.0)

project(adblocker)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_library(log-lib log)

# Add the JNI bridge source files and filtering engine
add_library(
    adblocker
    SHARED
    AdGuardJNIBridge.cpp
    FilterEngine.cpp
    FilterRule.cpp
    UrlParser.cpp
)

# Include directories
target_include_directories(adblocker PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Link libraries
target_link_libraries(
    adblocker
    ${log-lib}
)