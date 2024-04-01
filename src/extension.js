import St from 'gi://St';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class PanelMenuExtension extends Extension {
    enable() {
        try {
            const filePath = ".menu.json";
            const file = Gio.file_new_for_path(GLib.get_home_dir() + "/" + filePath);

            const [ok, contents, _] = file.load_contents(null);
            this.config = JSON.parse(contents);
            
            this._indicators = [];
            
            for (const item of this.config) {
                const indicator = new Panelmenu(item.name, item.icon, this.config);
                this._indicators.push(indicator);
                
                Main.panel.addToStatusArea("panel-menu_" + item.name, indicator);
            }
        } catch (e) {
            console.log(e);
        }
    }
    
    disable() {
        for (let i = 0; i < this._indicators.length; i++) {
            const indicator = this._indicators[i];
        indicator.destroy();
        }
    }
}

const Panelmenu = GObject.registerClass(
    {
    },
    class Panelmenu extends PanelMenu.Button {
        _init(MenuName, MenuIcon, config) {
            super._init(0, 'server');
            this.items = [];
            this._folders = {};
            this.icon = MenuIcon;
            this.name = MenuName;
            this.config = config;

            let hbox = new St.BoxLayout({style_class: 'panel-status-menu-box'});
            let icon = new St.Icon({
                icon_name: this.icon,
                style_class: 'system-status-icon',
            });
            hbox.add_child(icon);
            this.add_child(hbox);


            const menu1Items = this.config.find(item => item.name === this.name);
            if (menu1Items) {
                console.log('Menu1 items:', menu1Items.menu);
                this._createItems(menu1Items.menu);
            } else {
                console.log('Menu1 not found');
            }
            this.show();
        }

        destroy() {
            super.destroy();
        }

        _createItems(menu1Items) {
            for (const item of menu1Items) {
                if (item.icon) {
                    this.refreshButton = new PopupMenu.PopupImageMenuItem(
                        item.title,
                        item.icon
                    );
                  } else {
                    this.refreshButton = new PopupMenu.PopupMenuItem(item.title);
                  }
                
                this.refreshButton.label.x_expand = true;
                this.refreshButton.connect('activate', () => {
                    GLib.spawn_command_line_async(item.command);
                  });
                this.menu.addMenuItem(this.refreshButton);
            }
        }
    }
);
