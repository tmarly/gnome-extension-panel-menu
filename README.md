## Your own menu for the Gnome Panel

### Description
Inspired by SSHMenu and Command Menu, this extension offers the possibility to add several custom menus to the Gnome Panel.

### Installation
<a href="https://extensions.gnome.org/extension/6877/astrapios-panel-menu/">
<img src="https://github.com/andyholmes/gnome-shell-extensions-badge/raw/master/get-it-on-ego.svg" alt="Get it on EGO" width="200" />
</a>

### Example 1 ~/.menu.json

```
[
  {
    "name": "ssh",
    "icon": "view-more-horizontal-symbolic",
    "menu": [
      {
        "title": "user@server1.example.com",
        "command": "kgx --command='ssh user@server1.example.com'",
        "icon": "utilities-terminal"
      },
      {
        "type": "seperator"
      },
      {
        "title": "user@server2.example.com",
        "command": "kgx --command='ssh user@server2.example.com'",
        "icon": "utilities-terminal"
      }
    ]
  }
]
```
![screenshot](<screenshot.png>)

### Example 2 ~/.submenu.json

```
[
  {
    "name": "ssh",
    "icon": "view-more-horizontal-symbolic",
    "menu": [
        {
          "title": "user@server1.example.com",
          "command": "kgx --command='ssh user@server1.example.com'",
          "icon": "utilities-terminal"
        },
        {
          "title": "user@server2.example.com",
          "command": "kgx --command='ssh user@server2.example.com'",
          "icon": "utilities-terminal"
        }
    ]
  }
]
```
![screenshot](<screenshot.png>)

### Icons

Browse icons at: https://iconduck.com/sets/adwaita-icon-theme
