#!/bin/bash
#npm install --save-dev gulp
#npm install gulp-git --save
mkdir custom_node_modules
pushd custom_node_modules
if [ ! -d "gulp-git" ]; then
	git clone https://github.com/viknash/gulp-git.git
	pushd gulp-git
    git remote add upstream https://github.com/stevelacy/gulp-git.git
	npm link
	popd
else
	pushd gulp-git
    git fetch upstream
    git checkout master
    git merge upstream/master
    popd
fi
popd
npm link custom_node_modules/gulp-git
mkdir custom_brackets_extensions
pushd custom_brackets_extensions
if [ ! -d "brackets-gulp" ]; then
	git clone https://github.com/viknash/brackets-gulp.git
	pushd brackets-gulp
    git remote add upstream https://github.com/dalcib/brackets-gulp.git
    git checkout-index --prefix=$USERPROFILE/AppData/Roaming/Brackets/extensions/user/brackets-gulp/ -a
    popd
else
	pushd brackets-gulp
    git fetch upstream
    git checkout master
    git merge upstream/master
    git checkout-index --prefix=$USERPROFILE/AppData/Roaming/Brackets/extensions/user/brackets-gulp/ -a
    popd
fi
popd
npm install npm -g
npm install gulp -g
npm install grunt -g
npm install clever-cli -g
npm install node-theseus -g
