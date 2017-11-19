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
Ext.define("OMV.module.admin.storage.luks.CrypttabForm", {
	extend: "OMV.workspace.form.Panel",
	requires: [
		"OMV.data.Store",
		"OMV.data.Model",
		"OMV.data.proxy.Rpc"
	],
    id: "luksCrypttabForm",
	rpcService: "LuksMgmt",
	rpcGetMethod: "getAdvancedSettings",
	rpcSetMethod: "setAdvancedSettings",
    stateful: true,
    stateId: "24eb8cc1-3b30-48d0-9309-f278a3ad42f1",
    alias: "widget.luksCrypttabForm",

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
				boxLabel: _("Activate before-decrypt.target"),
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("Activating this will prevent all services (except SSH) from starting at boot. \
                    	After ssh login you can decrypt your drives with omv-decrypt-luks command as root. This will parse  \
                    	all devices in /etc/crypttab. Once decryption is finished, the server will mount all drives, activate all systemd services \
                    	until it reaches multi.-user.target. This will also add the noauto flag to every fstab line created by openmediavault \
                    	Drives will no longer be mounted at boot, but just using the decryption script supplied by the plugin.")
                }]
			},{
				xtype: "checkbox",
				name: "enablekeydevice",
				fieldLabel: _("Storage device"),
				checked: false,
				boxLabel: _("Use a external storage device to hold the decryption keys. The file name keys must be set in crypttab"),
	            listeners: {
	                change: function(cb, checked) {
	                    Ext.getCmp('devicefile').setDisabled(!checked);
	                }
	            },
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("The file name keys must be set in crypttab, and must reside in the root of the filesystem.")
                }]
			},{
				xtype: "combo",
				name: "devicefile",
				id: "devicefile",
				fieldLabel: _("Key device"),
				emptyText: _("Select a device ..."),
				allowBlank: false,
				allowNone: true,
				editable: false,
				boxLabel: _("Block device containing the keys."),
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("Make sure the filesystem is supported by linux. If the device is encrypted you will need to log into the   \
                     		 console via ssh to unlock this device.")
                }],
				triggerAction: "all",
				displayField: "description",
				valueField: "devicefile",
				disabled: true,
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

