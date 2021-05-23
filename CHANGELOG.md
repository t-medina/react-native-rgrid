# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2021-05-23

### Added

- Code-linting support with ESLint
- Linting job on CI configuration
- [Prettier](https://prettier.io/) support

### Changed

- `lodash.isequal` is no longer a dependency, having been replaced by custom comparison code
- `prop-types` has been changed to a **devDependency**
- Improved Readme file

## [1.0.1] - 2021-05-16

### Added

- Unit tests for **RGrid** and **RView** components
- Integration with [Travis CI](https://www.travis-ci.com/) and [Coveralls](https://coveralls.io/)

## [1.0.0] - 2021-05-10

### Added

- Components **RGrid** and **RView**
- Support for Bootstrap classes:
  - `container`
  - `container-fluid`
  - `container-{breakpoint}`
  - `row`
  - `col`
  - `col-{breakpoint}`
  - `col-*`
  - `col-{breakpoint}-*`
  - `col-auto`
  - `col-{breakpoint}-auto`

[unreleased]: https://github.com/t-medina/react-native-rgrid/compare/v1.0.2...develop
[1.0.2]: https://github.com/t-medina/react-native-rgrid/compare/1.0.1...v1.0.2
[1.0.1]: https://github.com/t-medina/react-native-rgrid/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/t-medina/react-native-rgrid/releases/tag/1.0.0
