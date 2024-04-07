import St from 'gi://St';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class PanelMenuExtension extends Extension {
    enable() {
        new panelMenu().create(this);
    }

    disable() {
        new panelMenu().destroy(this);
    }
}

class panelMenu {
    create(context) {
        console.log("panelMenu->create")
        this.context = context;
        try {
            const filePath = ".menu.json";
            const file = Gio.file_new_for_path(GLib.get_home_dir() + "/" + filePath);

            const [ok, contents, _] = file.load_contents(null);
            this.context.json = JSON.parse(contents);

            this.context._indicators = [];

            for (const item of this.context.json) {
                const indicator = new panelMenuButton(item.name, item.icon, this.context);
                this.context._indicators.push(indicator);

                Main.panel.addToStatusArea("panel-menu_" + item.name, indicator);
            }
        } catch (e) {
            console.log(e);
        }
    }

    destroy(context) {
        console.log("panelMenu->destroy")
        this.context = context;
        for (let i = 0; i < this.context._indicators.length; i++) {
            const indicator = this.context._indicators[i];
            indicator.destroy();
        }
    }

    reload(context) {
        console.log("panelMenu->reload")
        this.destroy(context)
        this.create(context)
    }

    addMenuItem(menu, title, icon, command) {
        this.menu = menu;
        this.title = title;
        this.command = command;
        this.icon = icon;

        if (this.icon) {
            this.refreshButton = new PopupMenu.PopupImageMenuItem(
                this.title,
                this.icon
            );
        } else {
            this.refreshButton = new PopupMenu.PopupMenuItem(this.title);
        }

        this.refreshButton.label.x_expand = true;
        this.refreshButton.connect('activate', () => {
            GLib.spawn_command_line_async(this.command);
        });
        menu.addMenuItem(this.refreshButton);
    }

    addReloadItem(context, menu) {
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.reloadButton = new PopupMenu.PopupImageMenuItem(
                "Reload",
                "view-refresh-symbolic"
            );
        this.reloadButton.connect('activate', () => {
            this.reload(context);
        });
        menu.addMenuItem(this.reloadButton);
    }

    addSeparatorMenuItem(menu) {
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }
}

const panelMenuButton = GObject.registerClass(
    {
    },
    class panelMenuButton extends PanelMenu.Button {
        _init(name, icon, context) {
            super._init(0, 'server');
            this.context = context
            this.icon = icon;
            this.name = name;

            this.items = [];
            this._folders = {};

            let menuBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            let menuIcon = new St.Icon({
                icon_name: this.icon,
                style_class: 'system-status-icon',
            });
            menuBox.add_child(menuIcon);
            this.add_child(menuBox);

            const menuItems = context.json.find(item => item.name === this.name);
            if (menuItems) {
                this._createItems(menuItems.menu);
            } else {
                console.log('.menu.json not found');
            }
            this.show();
        }

        destroy() {
            super.destroy();
        }

        _createItems(menuItems) {
            for (const menuItem of menuItems) {
                if (menuItem.type) {
                    switch (menuItem.type) {
                        case "seperator":
                            new panelMenu().addSeparatorMenuItem(this.menu);
                            break;
                        case "reload":
                            new panelMenu().addReloadItem(this.context, this.menu);
                            break;
                        case "submenu":
                            var self = this;
                            this.panelSubMenu = new PopupMenu.PopupSubMenuMenuItem(menuItem.title);

                            this.context.json.forEach(function (item) {
                                if (item.menu) {
                                    item.menu.forEach(function (subMenu) {
                                        if (subMenu.type === "submenu" && subMenu.submenu && menuItem.name == subMenu.name) {
                                            console.log(menuItem.name);
                                            subMenu.submenu.forEach(function (subMenuItem) {
                                                new panelMenu().addMenuItem(self.panelSubMenu.menu, subMenuItem.title, subMenuItem.icon, subMenuItem.command);
                                            });
                                        }
                                    });
                                }
                            });
                            this.menu.addMenuItem(this.panelSubMenu);
                            break;
                    }
                }
                else {
                    new panelMenu().addMenuItem(this.menu, menuItem.title, menuItem.icon, menuItem.command);
                }
            }
        }
    }
);