{% set luks_devices = salt['omv_conf.get'](
  'conf.system.storage.luks.device') %}

{% for device in luks_devices %}
{% do salt.log.info(device) %}

create_crypttab_entry_{{ device.uuid }}:
  file.accumulated:
    - filename: "/etc/crypttab"
    - text: "{{device.devicemappername}}\tUUID={{device.luksuuid}}\t{{device.passphrase}}\tnofail"
    - require_in:
      - file: append_crypttab_entries

{% endfor %}
