**Jira Template Extension**

![Jira templat extention](/_/preview2.png)

**What is it?**

A Jira templates extension for [TamperMokey](https://www.tampermonkey.net/) is a tool that allows you to create Jira issue templates quickly and easily.

**Why do you need it?**

Creating templates can be a time-consuming and complex process, especially if you need to create many templates or if you need custom templates. A Jira template extension can simplify the task and allow you to create templates quickly and easily.

**How does it work?**

Jira template extensions typically work by allowing you to create templates from `html` or `markdown`. You can then modify the templates as you wish by adding or removing fields, modifying field values, or changing the template format.

**Where to find an extension?**

In folder `projects` create a folder named by your type of templates like `dev`, `test`, `customer` ...ect

In this folder create a `project.json` contains this fields
```json
{
    // mame of your templates
    "name": "dev",
    // a simple descriptions
    "description": "templates for developper",
    // all your templates
    "templates": {
        // keys is name of your button
        // value the name for template file (in same folder)
        "Bug": "bug.html",
        // button mame can have icon, add your svg in `icons` folder
        // and add {icon:NAME_OF_YOUR_ICON}, example for bug.svg `{icon:bug}
        "{icon:taks} Task": "task.md",
    }
}
```


**Installation**

After you have create your templates run
```
python3 generate.py
```
Install TamperMonkey

go to extentions -> TamperMonkey -> create new script, paste the content of `output.js` and save (CTRL + S or menu File -> save)

go to jira and have fun!
![preview](/_/preview.png)
![preview](/_/choices.png)
![preview](/_/choices2.png)
![preview](/_/preview2.png)

**Html template**

Is preferable de create template in jirra issue, click on `copy` button and save it in `.html` file for the exacte same output (with color, link ...ect)