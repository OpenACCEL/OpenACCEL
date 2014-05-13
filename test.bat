@echo off
REM Build before testing.

REM Cleaning.
echo Cleaning any leftover files from previous (intermediate) builds.
rmdir doc /S /Q
rmdir bin /S /Q

REM Jade.
echo Compiling the view using jade.
call npm run jade

REM Deployment.
echo Deploying all files, such that it is ready for production.

mkdir                                                                                  bin\scripts
mkdir                                                                                  bin\img

xcopy lib                                                                              bin\scripts\ /S
copy node_modules\underscore\underscore-min.js                                         bin\scripts\underscore.js
copy node_modules\jquery\dist\jquery.min.js                                            bin\scripts\jquery.js
copy node_modules\requirejs\require.js                                                 bin\scripts\require.js
copy node_modules\sweet.js\lib\*.js                                                    bin\scripts
copy node_modules\sweet.js\macros\stxcase.js                                           bin\scripts\stxcase.js
copy node_modules\sweet.js\node_modules\escodegen\escodegen.browser.min.js             bin\scripts\escodegen.js
copy node_modules\sweet.js\node_modules\escope\escope.js                               bin\scripts\escope.js
copy node_modules\sweet.js\node_modules\escope\node_modules\estraverse\estraverse.js   bin\scripts\estraverse.js

cd src

for /r %%d in (*.js) do copy "%%d" "..\bin\scripts"
for /r %%d in (*.png) do copy "%%d" "..\bin\img"
copy accelstyle.css ..\bin\

cd ..

echo Creating .gitignore files.
copy NUL doc\.gitignore
copy NUL bin\.gitignore

REM We are done!
echo If everything went successful, all files are now in the bin/ directory.
echo Type 'npm start' to start a local HTTP server and test the program out at 'http://localhost:8080'.

REM Actual testing using mocha.
echo "Testing..."
mocha test test/model -u tdd