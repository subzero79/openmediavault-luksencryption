{% set config = salt['omv_conf.get']('conf.service.luks') %}
{% set systemd_path = '/etc/systemd/system' %}



{% if config.enable == True %}
  generate_decrypt_target:
    file.managed:
      - name: "/etc/systemd/system/decrypt.target"
      - source:
        - salt://{{ slspath }}/files/decrypt_target.j2
      - template: jinja
      - user: root
      - group: root
      - mode: 644

  generate_postdecrypt_target:
    file.managed:
      - name: "/etc/systemd/system/post-decrypt.target"
      - source:
        - salt://{{ slspath }}/files/post_decrypt_target.j2
      - template: jinja
      - user: root
      - group: root
      - mode: 644

  generate_finaldecrypt_target:
    file.managed:
      - name: "/etc/systemd/system/final-decrypt.target"
      - source:
        - salt://{{ slspath }}/files/final_decrypt_target.j2
      - template: jinja
      - user: root
      - group: root
      - mode: 644

  change_default_target:
    cmd.run:
      - name: systemctl set-default before-decrypt.target


{% else %}
  delete_targets:
    module.run:
      - file.find:
        - path: "/etc/systemd/system/"
        - grep: "openmediavault_luksencryption_target"
        - type: "f"
        - delete: "f"
        

  change_default_target:
    cmd.run:
      - name: systemctl set-default graphical.target


{% endif %}