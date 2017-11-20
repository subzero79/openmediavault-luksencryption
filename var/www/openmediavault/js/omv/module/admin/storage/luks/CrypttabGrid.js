/**
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @copyright Copyright (c) 2009-2013 Volker Theile
 * @copyright Copyright (c) 2013-2017 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/grid/Panel.js")
// require("js/omv/workspace/window/Form.js")
// require("js/omv/workspace/window/plugin/ConfigObject.js")
// require("js/omv/Rpc.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")
// require("js/omv/form/field/SharedFolderComboBox.js")

Ext.define("OMV.module.admin.storage.luks.device", {
    extend : "OMV.workspace.window.Form",
    uses   : [
        "OMV.form.field.SharedFolderComboBox",
        "OMV.workspace.window.plugin.ConfigObject"
    ],

    rpcService   : "LuksMgmt",
    rpcGetMethod : "getCrypttabDevice",
    rpcSetMethod : "setCrypttabDevice",
    plugins      : [{
        ptype : "configobject"
    }],
    alias: "widget.luksCrypttabGrid",

    getFormItems: function() {
        var me = this;
        return [
        {
            xtype: "combo",
            name: "devicefile",
            fieldLabel: "Block Device",
            allowBlank: false,
            valueField: "devicefile",
            displayField: "devicefile",
            allowEdit: false,
            store: Ext.create("OMV.data.Store", {
                autoLoad: true,
                storeId: "keydevice",
                model: OMV.data.Model.createImplicit({
                    idProperty: "keydevice",
                    fields: [
                        { name: "devicefile", type: "string" },
                        { name: "uuid", type: "string" },
                        { name: "size", type: "boolean" },
                        { name: "devicemappername", type: "string" },
                        { name: "_used", type: "boolean" }
                    ]
                }),
                proxy: {
                    type: "rpc",
                    appendSortParams: true,
                    rpcData: {
                        service: "LuksMgmt",
                        method: "getContainersList"
                    }
                },
                sorters: [{
                    direction: "ASC",
                    property: "devicefile"
                }]
            }),
            listeners: {
                scope: me,
/*                afterrender: function(c, eOpts) {
                    // Add tooltip to trigger button.
                    var trigger = c.getTrigger("search");
                    Ext.tip.QuickTipManager.register({
                        target: trigger.getEl(),
                        text: _("Scan")
                    });
                },*/
                select : function (combo, record) {
                    var devicefileInfo = record.get("devicefile");
                    var luksuuidInfo = record.get("luksuuid");
                    var devicemappernameInfo = record.get("devicemappername");
                    var usedInfo = record.get("_used");
                    if (devicemappernameInfo === "false") {
                        var devicemappernameInfo = "";
                    }
      
                    var devicefileField = me.findField("devicefile");
                    var luksuuidField = me.findField("luksuuid");
                    var devicemappernameField = me.findField("devicemappername");
                    var usedField = me.findField("_used");

                    devicefileField.setValue(devicefileInfo);
                    luksuuidField.setValue(luksuuidInfo);
                    devicemappernameField.setValue(devicemappernameInfo);
                    usedField.setValue(usedInfo);
                },
            },
            onTrigger2Click: function(c) {
                var me = this;
                // Reload list of detected external storage devices.
                delete me.lastQuery;
                me.store.reload();
            }
        },{
            xtype: "checkbox",
            name: "_used",
            id: "_used",
            fieldLabel: _("Referenced"),
            hidden: true,
            submitValue: false,
            listeners: {
                change: function(cb, checked) {
                    Ext.getCmp('devicemappername').setReadOnly(checked);
                }
            }
        },{
            xtype: "checkbox",
            name: "enable",
            fieldLabel: _("Use key file"),
            checked: false,
            listeners: {
                change: function(cb, checked) {
                    Ext.getCmp('keyfilename').setDisabled(!checked);
                }
            }
        },{
            xtype: "textfield",
            name: "keyfilename",
            id: "keyfilename",
            fieldLabel: _("Key file name"),
            allowBlank: false,
            disabled: true
        },{
            xtype: "textfield",
            name: "luksuuid",
            fieldLabel: _("LUKS UUID"),
            allowBlank: false,
            readOnly: true,
        },{
            xtype: "textfield",
            name: "name",
            id: "devicemappername",
            readOnly   : (me.uuid !== OMV.UUID_UNDEFINED),
            fieldLabel: _("Mapped name"),
            /*This field is then disabled for when the disk is mounted (referenced into omv internal db)*/
            // readOnly   : (me._used !== true),
            boxLabel: _("This is the mapped name you want to assign when the device is unlocked (ie: /dev/mapper/MyLUKSdeviceNAME)"),
            qtip1: "The device mapped name cannot be changed if the crypto device is referenced in the internal openmediavault database",
            listeners: {
                render: function(c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip1
                    });
                }
            }
        }];
    }
});

Ext.define("OMV.module.admin.storage.luks.CrypttabGrid", {
    extend   : "OMV.workspace.grid.Panel",
    requires : [
        "OMV.Rpc",
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc"
    ],
    uses     : [
        "OMV.module.admin.storage.luks.CrypttabGrid"
    ],
    id: "luksCrypttabGrid",

/*    defaults: {
        flex: 1
    },*/
    hidePagingToolbar : false,
    stateful          : true,
    stateId           : "9889057b-b2c0-4c48-a4c1-8c9b4fb54d76",
    alias             :"widget.luksCrypttabGrid",
    columns           : [{
        xtype     : "textcolumn",
        text      : _("Device Mapper Name"),
        sortable  : true,
        dataIndex : "name",
        stateId   : "name"
    },{
        xtype     : "textcolumn",
        text      : _("Key File"),
        sortable  : true,
        dataIndex : "enable",
        stateId   : "enable",
        renderer: function(value, metaData, record) {
                value = OMV.util.Format.boolean(value);
                return Ext.String.htmlEncode(value);
        }
    },{
        xtype     : "textcolumn",
        text      : _("LUKS UUID"),
        sortable  : true,
        dataIndex : "luksuuid",
        stateId   : "luksuuid"
    }],

    initComponent : function () {
        var me = this;
        Ext.apply(me, {
            store : Ext.create("OMV.data.Store", {
                autoLoad : true,
                model    : OMV.data.Model.createImplicit({
                    idProperty : "uuid",
                    fields     : [
                        { name  : "name", type: "string" },
                        { name  : "enable", type: "boolean" },
                        { name  : "luksuuid", type: "string" },
                        { name  : "uuid", type: "string" }
                    ]
                }),
                proxy    : {
                    type    : "rpc",
                    rpcData : {
                        service : "LuksMgmt",
                        method  : "getCrypttabList"
                    }
                }
            })
        });
        me.callParent(arguments);
    },

    onAddButton: function () {
        var me = this;
        Ext.create("OMV.module.admin.storage.luks.device", {
            title     : _("Add device to crypttab"),
            uuid      : OMV.UUID_UNDEFINED,
            listeners : {
                scope  : me,
                submit : function () {
                    this.doReload();
                }
            }
        }).show();
    },

    onEditButton: function () {
        var me = this;
        var record = me.getSelected();
        Ext.create("OMV.module.admin.storage.luks.device", {
            title     : _("Edit crypttab device"),
            uuid      : record.get("uuid"),
            listeners : {
                scope  : me,
                submit : function () {
                    this.doReload();
                }
            }
        }).show();
    },

    doDeletion: function (record) {
        var me = this;
        OMV.Rpc.request({
            scope    : me,
            callback : me.onDeletion,
            rpcData  : {
                service : "LuksMgmt",
                method  : "deleteCrypttabDevice",
                params  : {
                    uuid: record.get("uuid")
                }
            }
        });
    }
});
