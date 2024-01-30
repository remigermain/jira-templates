import os
import json
base = os.path.abspath(os.path.dirname(__file__))
PROJECT_FOLDER = os.path.join(base, "project")

TEMPLATES_VARS = {}

def gen_icons():
    for (folder, _, files) in os.walk(os.path.join(base, "icons")):
        for file in files:
            with open(os.path.join(folder, file), "r") as f:
                TEMPLATES_VARS[f"icon:{file.replace('.svg', '')}"] = f.read()

# replace icons
def sanitize_template(val):
    for key, value in TEMPLATES_VARS.items():
        val = val.replace("{" + key + "}", value)
    return val

# escape tilde ` 
def sanitize_tilde(val):
    return val.replace('`', "\`")


def main():
    gen_icons()
    projects = []
    for folder in os.listdir(PROJECT_FOLDER):
        with open(os.path.join(PROJECT_FOLDER, folder, "project.json"), "r") as f:
            project = json.load(f)
        
        templates = {}
        for key, value in project["templates"].items():
            with open(os.path.join(PROJECT_FOLDER, folder, value), "r") as f:
                templates[sanitize_template(key)] = {
                    "value": sanitize_template(f.read()),
                    "dataType": "text/html" if value.endswith(".html") else ""
                }
        project["templates"] = templates
        projects.append(project)

    # format templates
    total = ""
    for project in projects:
        name = sanitize_tilde(project["name"])
        description = sanitize_tilde(project.get("description", ""))
        pr = f"jira.addProject(`{name}`, `{description}`)"
        for key, val in project["templates"].items():
            key = sanitize_tilde(key)
            value = sanitize_tilde(val['value'])
            dataType = sanitize_tilde(val["dataType"])
            pr += f".addTemplate(`{key}`, `{value}`, `{dataType}`)"
        pr += ";\n"
        total += pr

    # read intertal script
    with open(os.path.join(base, "internal", "script.js"), "r") as f:
        val = sanitize_template(f.read().replace("// ---PROJECT---", total))

    # write output
    with open(os.path.join(base, "output.js"), "w") as f:
        f.write(val)
    
    print("script 'output.js' generate...")
if __name__ == "__main__":
    main()