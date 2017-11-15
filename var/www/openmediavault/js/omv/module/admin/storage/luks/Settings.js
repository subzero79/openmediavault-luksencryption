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
// require("js/omv/Rpc.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")

/**
 * @class OMV.module.admin.service.luks.Settings
 * @derived OMV.workspace.form.Panel
 */
Ext.define("OMV.module.admin.storage.luks.Settings", {
	extend: "OMV.workspace.form.Panel",
	requires: [
		"OMV.data.Store",
		"OMV.data.Model",
		"OMV.data.proxy.Rpc"
	],

	rpcService: "LuksMgmt",
	rpcGetMethod: "getAdvancedSettings",
	rpcSetMethod: "setAdvancedSettings",

	getFormItems : function() {
		var me = this;
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
			},{
				xtype: "combo",
				name: "devicefile",
				fieldLabel: _("Key device"),
				emptyText: _("Select a device ..."),
				allowBlank: false,
				allowNone: true,
				editable: false,
				boxLabel: _("Block device containing the keys"),
				triggerAction: "all",
				displayField: "description",
				valueField: "devicefile",
				triggers: {
					search: {
						cls: Ext.baseCSSPrefix + "form-search-trigger",
						handler: "onTrigger2Click"
					}
				},
				store: Ext.create("OMV.data.Store", {
					autoLoad: true,
					storeId: "keydevice",
					model: OMV.data.Model.createImplicit({
						idProperty: "keydevice",
						fields: [
							{ name: "devicefile", type: "string" },
							{ name: "uuid", type: "string" },
							{ name: "isencrypted", type: "boolean" },
							{ name: "description", type: "string" },
							{ name: "predictable", type: "string" }
						]
					}),
					proxy: {
						type: "rpc",
						appendSortParams: true,
						rpcData: {
							service: "LuksMgmt",
							method: "getKeyDevices"
						}
					},
					sorters: [{
						direction: "ASC",
						property: "devicefile"
					}]
				}),
				plugins: [{
					ptype: "fieldinfo",
					text: _("The external storage device.")
				}],
				listeners: {
					scope: me,
					afterrender: function(c, eOpts) {
						// Add tooltip to trigger button.
						var trigger = c.getTrigger("search");
						Ext.tip.QuickTipManager.register({
							target: trigger.getEl(),
							text: _("Scan")
						});
					},
					select : function (combo, record) {
						var uuidInfo = record.get("uuid");
						var isencryptedInfo = record.get("isencrypted");
						var descriptionInfo = record.get("description");
						var predictableInfo = record.get("predictable");
						
						var uuidField = me.findField("uuid");
						var isencryptedField = me.findField("isencrypted");
						var descriptionField = me.findField("description");
						var predictableField = me.findField("predictable");

						uuidField.setValue(uuidInfo);
						isencryptedField.setValue(isencryptedInfo);
						descriptionField.setValue(descriptionInfo);
						predictableField.setValue(predictableInfo);
					},
				},
				onTrigger2Click: function(c) {
					var me = this;
					// Reload list of detected external storage devices.
					delete me.lastQuery;
					me.store.reload();
				}
			},{
				xtype: "textfield",
				name: "description",
				fieldLabel: _("Descriptions"),
				hidden: true

			},{
				xtype: "checkbox",
				name: "isencrypted",
				fieldLabel: _("Encrypted"),
				hidden: true
			},{
				xtype: "textfield",
				name: "predictable",
				fieldLabel: _("Predictable"),
				hidden: true,
			},{
				xtype: "textfield",
				name: "uuid",
				fieldLabel: _("UUID"),
				hidden: true
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
