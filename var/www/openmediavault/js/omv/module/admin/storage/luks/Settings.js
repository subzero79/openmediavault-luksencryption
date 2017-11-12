/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2017 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")

/**
 * @class OMV.module.admin.service.luks.Settings
 * @derived OMV.workspace.form.Panel
 */
Ext.define("OMV.module.admin.storage.luks.Settings", {
	extend: "OMV.workspace.form.Panel",

	rpcService: "LuksMgmt",
	rpcGetMethod: "setAdvancedSettings",
	rpcSetMethod: "getAdvancedSettings",

	getFormItems : function() {
		return [{
			xtype: "fieldset",
			title: _("Settings"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enable",
				fieldLabel: _("Enable"),
				checked: false,
				boxLabel: _("Advanced headless decryption mode")
			}]
		}];
	}
});

OMV.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/storage/luks",
	text: _("Advanced Settings"),
	position: 20,
	className: "OMV.module.admin.storage.luks.Settings"
});
