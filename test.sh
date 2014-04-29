#!/bin/bash
# Build before testing.
npm run build

# Actual testing using mocha.
echo "Testing..."
mocha -u tdd
