export const executeIp = () => {
    return <>
        <span>1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN</span>
        <span>    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00</span>
        <span>    inet 127.0.0.1/8 scope host lo</span>
        <span>2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP</span>
        <span>    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff</span>
        <span>    inet 192.168.1.{Math.floor(Math.random() * 200 + 10)}/24 brd 192.168.1.255 scope global eth0</span>
        <span>3: wlan0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc noqueue state UP</span>
        <span>    link/ether a4:c3:f0:12:34:56 brd ff:ff:ff:ff:ff:ff</span>
        <span>    inet 192.168.0.{Math.floor(Math.random() * 200 + 10)}/24 brd 192.168.0.255 scope global wlan0</span>
    </>;
};
