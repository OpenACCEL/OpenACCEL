OpenACCEL
=========

The ACCEL system is a lightweight, general-purpose modeling environment for mathematical modeling. It combines some concepts from spreadsheets, Matlab and traditional highschool mathematics. For a live, up-to-date version see [http://openaccel.nl](http://openaccel.nl). To contact the developer: edward(at)openaccel(dot)nl

## Installation ##
[![Build Status](https://travis-ci.org/OpenACCEL/OpenACCEL.svg?branch=master)](https://travis-ci.org/OpenACCEL/OpenACCEL)

1. Install Node.
    1. `Linux`
        1. Install `node` from your repository.
    2. `Windows`
        1. Install Node with the installer from the official [Node](http://nodejs.org/download/) website.
        2. Install [Git Bash](http://git-scm.com/) and start the Git Bash terminal.
2. Clone a copy of the repository on your pc: `git clone https://github.com/OpenACCEL/OpenACCEL.git`.
3. Go to the OpenACCEL directory: `cd OpenACCEL`.
4. Install all dependencies using the command `npm install`.
5. To build and test OpenACCEL, type the following command: `npm test`.
6. Start a local HTTP server: `npm run quickbuild-server && npm run start`.
7. You can now use ACCEL by opening your web-browser and going to the address: [http://localhost:8080](http://localhost:8080).

## Scripts ##
OpenACCEL comes with a few pre-defined scripts for npm in order to easy everybody's life.
The follow scripts can all be invoked using `npm run`:

* `jade`: Generates the public .html files for the view in the `bin` folder.
* `doc`: Generates documentation from the source into the `doc` folder.

* `build`: Builds the entire project in the `bin` folder. NOTE: use `quickbuild-server` from v1.1 onwards.

* `quickbuild`: Builds the entire project in the `bin` folder, without also generating the documentation. NOTE: use `quickbuild-server` from v1.1 onwards.

* `quickbuild-server`: Like quickbuild, but for usage on a server. From version 1.1 onwards this command should always be used to build OpenACCEL, for the time being.

* `test`: Builds the system as indicated above, but also runs all test cases.

* `start`: Starts a local HTTP server. You can then access OpenACCEL through [http://localhost:8080](http://localhost:8080).

## FAQ ##
**Q**: How does the ACCEL language work? How is it compiled?

**A**: The ACCEL language is actual a superset of JavaScript. ACCEL scripts get fed through a compiler, which first invokes a pre-processor on the script. This pre-processor is pipeline of different passes, where each pass may have different functionalities, varying from script analysis to preparing the script for macro expansion. After the pre-processor has done its work, the entire script gets fed into the Sweet.js compiler, which expands all macros defined for the ACCEL modelling language. After all macros have been expanded, we end up with pure javascript that can be evaluated and executed.

**Q**: Why use Jade?

**A**: With Jade we are able to split the view into different modules. By creating a view for each tab, it is possible to combine all tabs into a single HTML page, such that the user does not have to crawl through different URLs, and to remain as close as possible to the implementation of ACCEL of which this library is based.

## License ##
[GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)
