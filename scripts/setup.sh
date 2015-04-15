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
npm install npm -g
npm install gulp -g
