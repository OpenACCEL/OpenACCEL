@echo off
REM Build before testing.
call npm run build-win

REM Actual testing using mocha.
echo "Testing..."
mocha test test/model -u tdd