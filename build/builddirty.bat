@echo off
rmdir doc /S /Q
rmdir bin /S /Q

call npm run jade

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
xcopy view\img ..\bin\img\ /S
xcopy view\css ..\bin\css\ /S

cd ..

copy NUL doc\.gitignore
copy NUL bin\.gitignore

call npm run start
echo DONE

