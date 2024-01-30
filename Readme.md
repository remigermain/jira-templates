# Installation
first install https://www.tampermonkey.net/ (for chrome or firefox)

run
```
python3 generate.py
```

go to extentions -> tampermonkey -> create new script, paste the content of `output.js` and save (CTRL + S or menu File -> save)

go to jira et hop

# Add new templates
go to `project/YOU_PROJECT`
open `project.json`
add in `template` you tempalte `key` is name of button, value is name of file
in button you can add `{icon:YOU_ICON_NAME}` and add you `YOU_ICON.svg` in icons folders

run `generate.py` copy content in tampermonkey

You can create many project template, create folder, project.json with `name` and `templates` keys, re-run `generate.py`

your template's file can be `.md` or `.html`
create your template in jira, click on `copy` button, paste it in `.html` file add it in `project.json`

# Icon
download icons form here -> https://tabler.io/icons