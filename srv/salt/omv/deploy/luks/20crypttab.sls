{% set devices = salt['omv_conf.get']('conf.service.luks.device') %}
{% set crypttab_file = '/etc/crypttab' %}
{% set header = '### >> openmediavault LUKS Plugin' %}
{% set footer = '### << openmediavault LUKS Plugin' %}

{% if devices | length >= 1 %}
  
generate_crypttab_map:
  file.blockreplace:
    - name: "{{ crypttab_file }}"
    - marker_start: "{{ header }}"
    - marker_end: "{{ footer }}"
    - content: ""
    - append_if_not_found: True
    - show_changes: True

{% for dev in devices %}

{% if dev.keyfilename == '' %}
{% set keyfile = 'none' %}
{% else %}
{% set keyfile = dev.keyfilename %}
{% endif %}

create_crypttab_entry_{{ dev.uuid }}:
  file.accumulated:
    - filename: "{{crypttab_file }}"
    - text: "{{ dev.name }}\tUUID={{ dev.luksuuid }}\t{{ keyfile }}\tluks,noauto"
    - require_in:
      - file: generate_crypttab_map

{% endfor %}

{% else %}

{% endif %}