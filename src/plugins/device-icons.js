var iconTab = [
    { type: 'default', icon: 'mdi-desktop-classic' },
    { type: 'Centos7', icon: 'mdi-centos' },
    { type: 'IP', icon: 'mdi-access-point' },
    { type: 'VIP', icon: 'mdi-centos' },
    { type: 'SW-Cisco', icon: 'mdi-access-point-network' },
    { type: 'ALOHA', icon: 'mdi-server' },
    { type: 'BARRACUDA', icon: 'mdi-barn' },
    { type: 'OlfeoBox', icon: 'mdi-laptop-mac' },
];

export function getIcon(type) {
    var found = '';
    for (let i = 0; i < iconTab.length; i++) {
        if (iconTab[i].type == type) {
            found = iconTab[i].icon;
        }
    }
    if (found) {
        return found;
    }
    return iconTab[0].icon;
}
