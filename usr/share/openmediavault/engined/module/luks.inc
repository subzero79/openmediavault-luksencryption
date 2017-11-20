<?php
/**
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @copyright Copyright (c) 2009-2015 Volker Theile
 * @copyright Copyright (c) 2015-2016 OpenMediaVault Plugin Developers
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

 class OMVModuleLuks extends \OMV\Engine\Module\ServiceAbstract
    implements \OMV\Engine\Notify\IListener, \OMV\Engine\Module\INotification {
    /**
     * Get the module name.
     */
    public function getName() {
        return "luks";
    }

    /**
     * Defines the modules that if present should build their configuration
     * before the service provided by this module.
     * @return An array of modules.
     */
    public function shouldApply() { return [ "systemd" ]; }


    /**
     * Defines the modules that if present should be applied before the service
     * provided by this module.
     * @return An array of modules.
     */
    public function shouldStart() { return [ "systemd", "sharedfolders", "email" ]; }



    public function startService() {
        $db = \OMV\Config\Database::getInstance();
        $objectluks = $db->get("conf.service.luks");
        if (TRUE !== $objectluks->get("enable"))
            return;
        $objects = $db->get("conf.system.sharedfolder");
        print("XXXXXX start XXXXXXXX");
        foreach ($objects as $objectk => $objectv) {
            $unitName = \OMV\System\SystemCtl::escape(build_path(
                DIRECTORY_SEPARATOR,
                \OMV\Environment::get("OMV_SHAREDFOLDERS_DIR"),
                $objectv->get("name")), [ "--path", "--suffix=mount" ]);
            // Mount the shared folder bind mount.
            $systemCtl = new \OMV\System\SystemCtl($unitName);
            $systemCtl->disable(TRUE);
        }
    }

/*    public function stopService() {
        $db = \OMV\Config\Database::getInstance();
        $objects = $db->get("conf.system.sharedfolder");
        print("XXXX STOP XXXXXX");
        foreach ($objects as $objectk => $objectv) {
            $unitName = \OMV\System\SystemCtl::escape(build_path(
                DIRECTORY_SEPARATOR,
                \OMV\Environment::get("OMV_SHAREDFOLDERS_DIR"),
                $objectv->get("name")), [ "--path", "--suffix=mount" ]);
            // Mount the shared folder bind mount.
            $systemCtl = new \OMV\System\SystemCtl($unitName);
            $systemCtl->enable($now=TRUE);
        }
    }*/

    /**
     * Generate the configuration.
     * @throw E_EXEC_FAILED
     */
    public function applyConfig() {
        $cmd = new \OMV\System\Process("omv-mkconf", "luks");
        $cmd->setRedirect2to1();
        $cmd->execute();
    }

    /**
     * Get the notification configuration.
     */
    public function getNotificationConfig() {
        return [
            [
                "id"    => "luks",
                "type"  => getText("Storage"),
                "title" => gettext("Encryption")
            ]
        ];
    }

    /**
     * Bind listeners.
     */
    function bindListeners(\OMV\Engine\Notify\Dispatcher $dispatcher) {
        $dispatcher->addListener(
            OMV_NOTIFY_CREATE | OMV_NOTIFY_MODIFY | OMV_NOTIFY_DELETE,
            "org.openmediavault.system.storage.luks.container",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.system.notification.email",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.system.notification.notification",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY,
            "org.openmediavault.conf.service.luks",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY | OMV_NOTIFY_CREATE | OMV_NOTIFY_DELETE,
            "org.openmediavault.conf.service.luks.device",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY | OMV_NOTIFY_CREATE | OMV_NOTIFY_DELETE,
            "org.openmediavault.conf.system.filesystem.mountpoint",
            [ $this, "setDirty" ]);
        $dispatcher->addListener(
            OMV_NOTIFY_MODIFY | OMV_NOTIFY_CREATE | OMV_NOTIFY_DELETE,
            "org.openmediavault.conf.system.sharedfolder",
            [ $this, "setDirty" ]);
    }
}
