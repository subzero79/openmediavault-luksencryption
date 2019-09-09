<?php
/**
 * Copyright (c) 2015-2019 OpenMediaVault Plugin Developers
 *
 * @category OMVLuksUtil
 * @package  Openmediavault-luksencryption
 * @author   OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     https://github.com/OpenMediaVault-Plugin-Developers/openmediavault-docker-gui
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


use OMV\Config\Database;
use OMV\Config\ConfigObject;
use OMV\Rpc\ServiceAbstract;
use OMV\Engine\Notify;
use OMV\System\SystemCtl;
use OMV\System\Process;
use OMV\Rpc\Rpc;
use OMV\System\Filesystem\Filesystem;
use Exception;
use OMV\System\Storage\Backend\DM;


/**
 * Helper class for Luks module
 *
 * @category Class
 * @package  Openmediavault-luksencryption
 * @author   OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     https://github.com/OpenMediaVault-Plugin-Developers/openmediavault-docker-gui
 *
 */
class OMVLuksUtil
{
    // static private $dataModelPath = 'conf.service.docker';
    // static private $database;

    /**
     * Returns the $fstab entries processed
     *
     * @param object Configuration object for conf.service.luks
     * 
     * @param object context
     * 
     * @return string $fstab_entries the modified fstab entries
     */
    public static function modifyFsTabDB($params,$context)
    {
        $entries = Rpc::call('FsTab', 'enumerateEntries', [], $context);
        $fstab_entries = [];
        // Enabling before-decrypt.target we need to modify the fstab db entries of all fs registered with omv
        if ($params['enable'] === TRUE) {
            // We need to add noauto to each mntent entry
            // print_r($entries[0]);
            foreach ($entries as $key) {
                // Convert options to array
                $opts = explode(',', $key['opts']);
                // Check if noauto is present
                if  (array_search("noauto",$opts) === FALSE )  { 
                // Add noauto, and convert the key['opts] array back to string
                    array_push($opts, 'noauto');
                    $key['opts'] = implode(',', $opts);
                }
                // Push the options to the fstab object
                array_push($fstab_entries, $key);
            }
        } else {
            // IF before-decrypt.target is disabled we need to get rid of all noauto options
           foreach ($entries as $key) {
                // Convert options to array
                $opts = explode(',', $key['opts']);
                // Check if noauto is present, should return the array index
                $noauto_index = array_search("noauto",$opts);
                if ( $noauto_index >= 0 ) { 
                // Add noauto, and convert the key['opts] array back to string
                    unset($opts[$noauto_index]);
                    $key['opts'] = implode(',', $opts);
                }
                // Push the object to the fstab array
                array_push($fstab_entries, $key);
            }
        }

        // Finally we push every new fstab mntent to the db
        foreach ($fstab_entries as $key) {
            Rpc::call('FsTab','set', $key, $context);
        }
        return $fstab_entries;
    }

}
