import type { Runbook, RunbookNode } from '../types/runbook';

/**
 * ==============================================================================
 * 🌐 RUNBOOK: CHẨN ĐOÁN SỰ CỐ MẠNG NỘI BỘ & INTERNET (NETWORK L1 - L3/L7)
 * ==============================================================================
 * Kịch bản chẩn đoán thực chiến chuẩn IT Ops / Helpdesk từ tầng vật lý đến ứng dụng.
 * ==============================================================================
 */

const nodes: Record<string, RunbookNode> = {
  // ----------------------------------------------------------------------------
  // TẦNG L1: PHYSICAL LAYER (Cáp mạng, Link Light, Wi-Fi Radio)
  // ----------------------------------------------------------------------------
  'net-l1-cable-check': {
    id: 'net-l1-cable-check',
    kind: 'diagnostic_step',
    osiLayer: 'L1',
    title: 'Kiểm tra Liên kết Vật lý (Cáp RJ45 / Wi-Fi)',
    description: 'Kiểm tra đèn tín hiệu cổng mạng (Link/Activity LED) trên card mạng máy trạm hoặc trạng thái kết nối SSID Wi-Fi.',
    technicalContext: 'Tầng L1 quy định tín hiệu điện/quang và sóng vô tuyến. Nếu đèn LED cổng LAN tắt (No Link Light), NIC không bắt tay được (Auto-Negotiation Failed) với Switch hoặc cáp bị đứt sợi dẫn.',
    command: {
      cli: 'netsh interface show interface',
      os: 'windows',
      description: 'Kiểm tra trạng thái kết nối của các Adapter mạng trên máy trạm Windows',
      sampleOutput: `Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Connected      Dedicated        Ethernet
Enabled        Disconnected   Dedicated        Wi-Fi`,
      outputAnalysisGuide: 'Nếu State là "Disconnected" dù đã cắm cáp, khả năng cao lỏng cáp, gãy lẫy bấm RJ45 hoặc cổng switch phía đối diện bị disable/shut down.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'ip link show',
        os: 'linux',
        description: 'Kiểm tra trạng thái liên kết vật lý (L1/L2) của card mạng trên Linux',
        sampleOutput: `2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN mode DEFAULT group default qlen 1000
    link/ether 00:15:5d:01:ca:82 brd ff:ff:ff:ff:ff:ff`,
        outputAnalysisGuide: 'Cờ NO-CARRIER và state DOWN chỉ ra không có tín hiệu điện từ Switch.',
      },
    ],
    branches: [
      {
        id: 'b-l1-ok',
        label: 'Đèn LED sáng xanh/cam nhấp nháy, Adapter báo "Connected"',
        description: 'Tầng vật lý L1 thông suốt, bắt tay thành công ở tốc độ 100M/1Gbps.',
        nextNodeId: 'net-l2-ip-check',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-l1-fail',
        label: 'Đèn cổng tắt ngúm hoặc Adapter báo "Disconnected / Cable Unplugged"',
        description: 'Mất liên kết vật lý hoàn toàn.',
        nextNodeId: 'net-l1-reconnect-action',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l1-reconnect-action': {
    id: 'net-l1-reconnect-action',
    kind: 'action_required',
    osiLayer: 'L1',
    title: 'Xử lý Liên kết Cáp & Đổi Cổng Patch Panel',
    description: 'Rút đầu cắm RJ45 cắm lại nghe tiếng "click", kiểm tra hai đầu dây mạng tại ổ cắm tường (Wall Plate) và cắm thử sang một cổng mạng khác hoặc thay sợi cáp Patch Cord dự phòng.',
    technicalContext: 'Hơn 40% sự cố mạng tại chỗ phát sinh do gãy chân lẫy RJ45, chập dây do bàn ghế đè lên hoặc cổng Switch Access bị rơi vào trạng thái err-disabled.',
    branches: [
      {
        id: 'b-l1-fixed',
        label: 'Đèn cổng đã sáng lại bình thường sau khi đổi dây / cắm lại',
        description: 'Liên kết L1 đã được khôi phục.',
        nextNodeId: 'net-l2-ip-check',
        badgeVariant: 'success',
      },
      {
        id: 'b-l1-broken',
        label: 'Đã thay dây và đổi ổ cắm tường nhưng đèn vẫn tắt',
        description: 'Nghi ngờ đứt đường cáp âm tường hoặc cổng Switch trung tâm bị hỏng/khóa port security.',
        nextNodeId: 'net-l1-escalate-hardware',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l1-escalate-hardware': {
    id: 'net-l1-escalate-hardware',
    kind: 'escalation',
    osiLayer: 'L1',
    title: 'Chuyển Tuyến L2: Hỏng Đường Cáp Âm Tường hoặc Cổng Switch Tầng',
    description: 'Chuyển sự cố tới Đội Hạ tầng Mạng để dùng máy đo cáp (Fluke Cable Tester) kiểm tra thông mạch và bật lại cổng Switch.',
    branches: [],
    escalationDetails: {
      targetTier: 'L2 Network Team',
      priority: 'P3 - Medium',
      contactChannel: 'Slack #noc-support hoặc Ticket Helpdesk',
      requiredInfo: [
        'Vị trí bàn làm việc / Tên phòng ban người dùng',
        'Mã nhãn ổ cắm mạng âm tường (Wall Plate Label, vd: P-04-A12)',
        'Mã định danh Switch tầng & Port tương ứng (nếu tra cứu được qua sơ đồ mạng)',
        'Đã xác nhận thử bằng cáp Patch Cord mới nhưng vẫn không lên đèn',
      ],
      suggestedRemediation: 'Kỹ thuật viên L2 dùng máy bấm cáp kiểm tra pin 1-2-3-6, hoặc đăng nhập Switch kiểm tra trạng thái interface (`show interface status`) xem có bị err-disabled do port-security vi phạm địa chỉ MAC hay không.',
    },
  },

  // ----------------------------------------------------------------------------
  // TẦNG L2 / L3: CẤP PHÁT ĐỊA CHỈ IP & DHCP
  // ----------------------------------------------------------------------------
  'net-l2-ip-check': {
    id: 'net-l2-ip-check',
    kind: 'diagnostic_step',
    osiLayer: 'L3',
    title: 'Kiểm tra Cấu hình IP & Default Gateway',
    description: 'Kiểm tra xem máy trạm có nhận được địa chỉ IP hợp lệ từ máy chủ DHCP nội bộ (10.x.x.x, 172.16-31.x.x, 192.168.x.x) hay rơi vào dải tự gán lỗi APIPA (169.254.x.x).',
    technicalContext: 'Khi client gửi DHCP Discover nhưng không nhận được DHCP Offer sau 4 lần thử, Windows/Linux sẽ tự động fallback sang cơ chế APIPA (Automatic Private IP Addressing 169.254.0.0/16). Lúc này máy chỉ liên lạc được trong mạng con giả lập, hoàn toàn không ra được Gateway.',
    command: {
      cli: 'ipconfig /all',
      os: 'windows',
      description: 'Xem toàn bộ cấu hình IPv4, Subnet Mask, Default Gateway và DHCP Server',
      sampleOutput: `Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : corp.internal
   Link-local IPv6 Address . . . . . : fe80::d812:76a2:e01b:f810%12
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1, 8.8.8.8`,
      outputAnalysisGuide: 'Kiểm tra 3 giá trị: IPv4 Address (không được là 169.254.x.x), Default Gateway (phải có IP) và DNS Servers.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'ip -br -4 addr show',
        os: 'linux',
        description: 'Xem nhanh địa chỉ IPv4 của các card mạng trên Linux',
        sampleOutput: `lo               UNKNOWN        127.0.0.1/8 
eth0             UP             192.168.1.105/24`,
        outputAnalysisGuide: 'Nếu eth0 không có địa chỉ IPv4 đi kèm, dịch vụ NetworkManager hoặc systemd-networkd chưa xin được IP qua DHCP.',
      },
    ],
    branches: [
      {
        id: 'b-l2-valid',
        label: 'Có địa chỉ IP hợp lệ và Default Gateway (vd: 192.168.1.1)',
        description: 'Client đã được cấp phát cấu hình mạng đầy đủ.',
        nextNodeId: 'net-l3-ping-gateway',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-l2-apipa',
        label: 'Nhận IP dải 169.254.x.x (Lỗi APIPA / Không liên lạc được DHCP Server)',
        description: 'Không nhận được phản hồi DHCP Offer từ Router/Server.',
        nextNodeId: 'net-l2-dhcp-renew',
        badgeVariant: 'danger',
      },
      {
        id: 'b-l2-no-gateway',
        label: 'Có IP tĩnh hoặc IP cấp nhưng thiếu Default Gateway (Default Gateway để trống)',
        description: 'Sai cấu hình Scope DHCP hoặc lỗi cấu hình Static IP thủ công.',
        nextNodeId: 'net-l3-gateway-missing',
        badgeVariant: 'warning',
      },
    ],
  },

  'net-l2-dhcp-renew': {
    id: 'net-l2-dhcp-renew',
    kind: 'diagnostic_step',
    osiLayer: 'L7',
    title: 'Giải Phóng & Xin Cấp Lại IP (DHCP Release & Renew)',
    description: 'Hủy bỏ lease IP hiện tại và gửi gói tin broadcast DHCP Discover mới để xin cấp lại IP từ DHCP Server.',
    technicalContext: 'Quá trình Renew sẽ kiểm tra xem DHCP Relay Agent trên Switch hoặc DHCP Server chính còn slot trống (Scope Pool) hay đã bị cạn kiệt (Pool Exhaustion).',
    command: {
      cli: 'ipconfig /release && ipconfig /renew',
      os: 'windows',
      description: 'Giải phóng IP cũ và yêu cầu DHCP cấp phát IP mới',
      sampleOutput: `Windows IP Configuration

No operation can be performed on Wi-Fi while it has its media disconnected.

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : corp.internal
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
      outputAnalysisGuide: 'Nếu lệnh renew chạy trong 30 giây rồi báo lỗi "The operation failed as no adapter is in the state permissible for this operation" hoặc timeout, DHCP Server đang bị treo hoặc pool đã hết địa chỉ.',
      requiresElevation: true,
      timeoutSeconds: 30,
    },
    alternativeCommands: [
      {
        cli: 'sudo dhclient -r && sudo dhclient -v eth0',
        os: 'linux',
        description: 'Giải phóng và xin cấp lại IP qua DHCP trên Linux',
        sampleOutput: `DHCPDISCOVER on eth0 to 255.255.255.255 port 67 interval 3
DHCPOFFER of 192.168.1.105 from 192.168.1.1
DHCPREQUEST for 192.168.1.105 on eth0 to 255.255.255.255 port 67
DHCPACK of 192.168.1.105 from 192.168.1.1
bound to 192.168.1.105 -- renewal in 43200 seconds.`,
        outputAnalysisGuide: 'Quan sát chu trình DORA (Discover -> Offer -> Request -> Ack). Nếu dừng ở DHCPDISCOVER liên tục là server không phản hồi.',
      },
    ],
    branches: [
      {
        id: 'b-dhcp-success',
        label: 'Cấp lại thành công IP hợp lệ (hết dải 169.254.x.x)',
        description: 'Đã nhận được IP và Default Gateway.',
        nextNodeId: 'net-l3-ping-gateway',
        badgeVariant: 'success',
      },
      {
        id: 'b-dhcp-timeout',
        label: 'Lệnh Timeout / Vẫn nhận lại IP 169.254.x.x',
        description: 'DHCP Pool của VLAN này đã cạn hoặc DHCP Relay Agent trên Core Switch bị lỗi.',
        nextNodeId: 'net-l2-dhcp-escalate',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l2-dhcp-escalate': {
    id: 'net-l2-dhcp-escalate',
    kind: 'escalation',
    osiLayer: 'L7',
    title: 'Chuyển Tuyến L3: Máy Chủ DHCP Treo hoặc Cạn Kiệt IP Scope Pool',
    description: 'Chuyển ticket khẩn cấp cho Đội Quản trị Hệ thống / Mạng (L3) để mở rộng Scope DHCP hoặc khởi động lại dịch vụ DHCP Server.',
    branches: [],
    escalationDetails: {
      targetTier: 'L3 Systems',
      priority: 'P2 - High',
      contactChannel: 'Slack #sysadmin-oncall hoặc Ticket P2',
      requiredInfo: [
        'VLAN ID / Subnet đang gặp sự cố (ví dụ: VLAN 10 - 192.168.10.0/24)',
        'Địa chỉ MAC của máy trạm gặp sự cố',
        'Số lượng máy trạm bị ảnh hưởng (1 người hay toàn bộ khu vực)',
        'Kết quả log timeout khi chạy lệnh ipconfig /renew',
      ],
      suggestedRemediation: 'Kiểm tra Windows Server DHCP / Kea DHCP scope statistics. Mở rộng dải IP hoặc dọn dẹp các lease IP cũ hết hạn (Expired Leases). Kiểm tra ip helper-address trên Switch Layer 3.',
    },
  },

  'net-l3-gateway-missing': {
    id: 'net-l3-gateway-missing',
    kind: 'action_required',
    osiLayer: 'L3',
    title: 'Kiểm tra Cấu hình IP Tĩnh (Static IP) & Route Table',
    description: 'Máy trạm có thể bị người dùng gán IP tĩnh sai hoặc thiết lập thiếu Default Gateway. Chuyển adapter về chế độ "Obtain an IP address automatically (DHCP)".',
    technicalContext: 'Default Gateway là cổng xuất phát bắt buộc của mọi gói tin có đích đến nằm ngoài mạng cục bộ (Route 0.0.0.0/0). Nếu không có Gateway, máy trạm chỉ có thể gửi gói tin ARP trong cùng broadcast domain.',
    command: {
      cli: 'route print 0.0.0.0',
      os: 'windows',
      description: 'Kiểm tra Default Route trong bảng định tuyến Windows',
      sampleOutput: `Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
          0.0.0.0          0.0.0.0      192.168.1.1   192.168.1.105      25`,
      outputAnalysisGuide: 'Nếu kết quả báo "No routes found", máy tính không biết chuyển gói tin ra internet qua router nào.',
      requiresElevation: false,
    },
    branches: [
      {
        id: 'b-gw-reset-dhcp',
        label: 'Đã chuyển về nhận IP tự động và nhận được Gateway',
        description: 'Khôi phục Default Route thành công.',
        nextNodeId: 'net-l3-ping-gateway',
        badgeVariant: 'success',
      },
      {
        id: 'b-gw-manual-fill',
        label: 'Đã gán Default Gateway thủ công đúng chuẩn',
        description: 'Bổ sung Gateway IP chuẩn vào cấu hình tĩnh.',
        nextNodeId: 'net-l3-ping-gateway',
        badgeVariant: 'info',
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // TẦNG L3: DEFAULT GATEWAY & ARP RESOLUTION
  // ----------------------------------------------------------------------------
  'net-l3-ping-gateway': {
    id: 'net-l3-ping-gateway',
    kind: 'diagnostic_step',
    osiLayer: 'L3',
    title: 'Kiểm tra Kết nối tới Default Gateway (Ping Router)',
    description: 'Gửi gói tin ICMP Echo Request tới địa chỉ IP của Default Gateway (Router/Core Switch) để xác nhận đường truyền trong mạng nội bộ thông suốt.',
    technicalContext: 'Ping Default Gateway kiểm tra tính toàn vẹn của kết nối L2/L3 giữa máy trạm và Router. Nếu ping Gateway thất bại, sự cố nằm trong mạng LAN (cáp, switch, ARP, VLAN). Nếu ping thành công, mạng LAN hoàn hảo và sự cố nằm ở phía WAN/Internet.',
    command: {
      cli: 'ping 192.168.1.1 -n 4',
      os: 'windows',
      description: 'Ping 4 gói tin ICMP tới Default Gateway (thay bằng IP Gateway thực tế của bạn)',
      sampleOutput: `Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms`,
      outputAnalysisGuide: 'Thời gian phản hồi time < 2ms và 0% loss chứng tỏ mạng nội bộ cực tốt. Nếu nhận "Destination host unreachable" hoặc "Request timed out", kiểm tra bảng ARP ở bước kế tiếp.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'ping -c 4 $(ip route | grep default | awk "{print \\$3}")',
        os: 'linux',
        description: 'Tự động lấy IP Gateway và ping 4 gói trên Linux',
        sampleOutput: `PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.428 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.385 ms

--- 192.168.1.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3072ms`,
        outputAnalysisGuide: '0% packet loss: kết nối nội bộ LAN hoàn toàn bình thường.',
      },
    ],
    branches: [
      {
        id: 'b-ping-gw-ok',
        label: 'Ping Gateway thành công (Reply < 2ms, 0% packet loss)',
        description: 'Mạng LAN nội bộ hoạt động tốt. Chuyển sang kiểm tra kết nối Internet ra ngoài.',
        nextNodeId: 'net-l3-ping-dns-ip',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-ping-gw-fail',
        label: 'Request timed out hoặc Destination host unreachable',
        description: 'Không thể giao tiếp với Router/Gateway.',
        nextNodeId: 'net-l3-arp-check',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l3-arp-check': {
    id: 'net-l3-arp-check',
    kind: 'diagnostic_step',
    osiLayer: 'L2',
    title: 'Kiểm tra Bảng Phân giải Địa chỉ ARP (Address Resolution Protocol)',
    description: 'Kiểm tra xem máy trạm có học được địa chỉ MAC vật lý của Default Gateway thông qua giao thức ARP hay không.',
    technicalContext: 'Trước khi gửi gói tin IP tới Gateway, máy trạm bắt buộc phải phân giải IP Gateway thành địa chỉ MAC qua bản tin ARP Request/Reply. Nếu ARP cache ghi nhận IP Gateway là "incomplete" hoặc không xuất hiện, Switch Access đang cô lập port (VLAN isolation, PVLAN) hoặc IP Gateway bị cấu hình trùng (IP Conflict).',
    command: {
      cli: 'arp -a | findstr 192.168.1.1',
      os: 'windows',
      description: 'Tra cứu địa chỉ MAC của Gateway trong ARP cache của Windows',
      sampleOutput: `  Internet Address      Physical Address      Type
  192.168.1.1           b8-27-eb-93-12-aa     dynamic`,
      outputAnalysisGuide: 'Nếu Physical Address là dãy số MAC hợp lệ nhưng không ping được: Gateway bị chặn ICMP hoặc Router treo phần mềm. Nếu không tìm thấy dòng nào: Lỗi giao tiếp L2 trên Switch.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'ip neigh show | grep $(ip route | grep default | awk "{print \\$3}")',
        os: 'linux',
        description: 'Xem trạng thái ARP/Neighbor table trên Linux',
        sampleOutput: `192.168.1.1 dev eth0 lladdr b8:27:eb:93:12:aa REACHABLE`,
        outputAnalysisGuide: 'Trạng thái REACHABLE/DELAY là tốt. Nếu hiển thị INCOMPLETE hoặc FAILED nghĩa là không nhận được phản hồi ARP Reply.',
      },
    ],
    branches: [
      {
        id: 'b-arp-has-mac',
        label: 'Có địa chỉ MAC hợp lệ trong bảng ARP nhưng ping vẫn rớt',
        description: 'Gateway nhận diện được thiết bị nhưng bị quá tải, sập tiến trình định tuyến hoặc bật tường lửa chặn ICMP.',
        nextNodeId: 'net-l3-gateway-down-escalate',
        badgeVariant: 'warning',
      },
      {
        id: 'b-arp-incomplete',
        label: 'Không có MAC / Báo "incomplete" / "No ARP Entries Found"',
        description: 'Gói tin ARP không vượt qua được Switch (Sai VLAN hoặc Switch port bị đóng).',
        nextNodeId: 'net-l3-vlan-mismatch-escalate',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l3-gateway-down-escalate': {
    id: 'net-l3-gateway-down-escalate',
    kind: 'escalation',
    osiLayer: 'L3',
    title: 'Chuyển Tuyến L2/L3: Thiết Bị Default Gateway Không Phản Hồi Gói Tin',
    description: 'Chuyển cho Đội Quản trị Mạng để kiểm tra tình trạng tải CPU của Router Gateway, kiểm tra bảng ACL chặn gói hoặc khởi động lại interface.',
    branches: [],
    escalationDetails: {
      targetTier: 'L2 Network Team',
      priority: 'P1 - Critical',
      contactChannel: 'Kênh khẩn cấp NOC / Hotline Oncall',
      requiredInfo: [
        'Địa chỉ IP Default Gateway bị mất liên lạc',
        'VLAN ID và dải mạng văn phòng tương ứng',
        'Địa chỉ MAC của Gateway ghi nhận trong ARP cache',
        'Phạm vi ảnh hưởng: Có bao nhiêu máy cùng subnet bị mất kết nối',
      ],
      suggestedRemediation: 'Đăng nhập vào Router/Firewall Gateway, kiểm tra CPU load, log HSRP/VRRP failover, hoặc kiểm tra chính sách ICMP rate-limit.',
    },
  },

  'net-l3-vlan-mismatch-escalate': {
    id: 'net-l3-vlan-mismatch-escalate',
    kind: 'escalation',
    osiLayer: 'L2',
    title: 'Chuyển Tuyến L2: Cổng Switch Bị Gán Sai VLAN hoặc Port-Security Chặn',
    description: 'Cổng switch của máy trạm bị nhầm Access VLAN (ví dụ gán nhầm sang VLAN Guest/IoT) nên không nhìn thấy Gateway của dải IP được cấp.',
    branches: [],
    escalationDetails: {
      targetTier: 'L2 Network Team',
      priority: 'P2 - High',
      contactChannel: 'Slack #network-ops',
      requiredInfo: [
        'Mã cổng mạng âm tường hoặc Switch Name + Port Number (vd: SW-FL02-PORT18)',
        'Địa chỉ MAC card mạng của người dùng',
        'IP nhận được hiện tại và Subnet dự kiến',
      ],
      suggestedRemediation: 'Quản trị viên mạng chạy lệnh `show mac address-table interface ...` và `show run interface ...` để cấu hình lại đúng VLAN ID theo chính sách phòng ban.',
    },
  },

  // ----------------------------------------------------------------------------
  // TẦNG L3/L4: WAN INTERNET ROUTING & TRACEROUTE
  // ----------------------------------------------------------------------------
  'net-l3-ping-dns-ip': {
    id: 'net-l3-ping-dns-ip',
    kind: 'diagnostic_step',
    osiLayer: 'L3',
    title: 'Kiểm tra Định Tuyến Internet Ra Ngoài (Ping Public IP)',
    description: 'Gửi gói tin ICMP trực tiếp tới địa chỉ IP Public trên Internet (Google DNS 8.8.8.8 hoặc Cloudflare DNS 1.1.1.1) bỏ qua khâu phân giải tên miền DNS.',
    technicalContext: 'Đây là phép thử chìa khóa để phân lập lỗi: Nếu ping IP 8.8.8.8 thành công nhưng không lướt web được, 100% nguyên nhân do DNS (L7). Ngược lại nếu không ping được 8.8.8.8, nguyên nhân là đứt kết nối WAN ISP, lỗi NAT hoặc Tường lửa chặn luồng ra (Outbound Firewall).',
    command: {
      cli: 'ping 8.8.8.8 -n 4',
      os: 'windows',
      description: 'Ping trực tiếp địa chỉ Public IP 8.8.8.8 để kiểm tra thông tuyến Internet',
      sampleOutput: `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=24ms TTL=115
Reply from 8.8.8.8: bytes=32 time=25ms TTL=115
Reply from 8.8.8.8: bytes=32 time=24ms TTL=115
Reply from 8.8.8.8: bytes=32 time=24ms TTL=115

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 24ms, Maximum = 25ms, Average = 24ms`,
      outputAnalysisGuide: 'Có Reply từ 8.8.8.8: Đường truyền WAN ra Internet hoàn toàn bình thường. Chuyển ngay sang kiểm tra phân giải tên miền DNS!',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'ping -c 4 8.8.8.8',
        os: 'linux',
        description: 'Ping 8.8.8.8 trên Linux',
        sampleOutput: `4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 23.411/24.120/25.012/0.612 ms`,
        outputAnalysisGuide: '0% packet loss -> Đường WAN thông suốt.',
      },
    ],
    branches: [
      {
        id: 'b-ping-wan-ok',
        label: 'Ping 8.8.8.8 thành công (Reply ổn định, 0% packet loss)',
        description: 'Tuyến WAN Internet thông suốt. Tiếp tục kiểm tra dịch vụ tên miền DNS.',
        nextNodeId: 'net-l7-dns-resolution',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-ping-wan-fail',
        label: '100% Request timed out khi ping 8.8.8.8',
        description: 'Gói tin không thể đi ra ngoài Internet. Cần dò tìm điểm đứt gãy bằng Traceroute.',
        nextNodeId: 'net-l3-traceroute-wan',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l3-traceroute-wan': {
    id: 'net-l3-traceroute-wan',
    kind: 'diagnostic_step',
    osiLayer: 'L3',
    title: 'Dò Tìm Điểm Nghẽn Tuyến Đường Bằng Traceroute',
    description: 'Chạy lệnh traceroute tới 8.8.8.8 với tùy chọn không phân giải tên miền (-d) để phát hiện chính xác gói tin bị chặn tại đâu: Router nội bộ, Tường lửa (Firewall) hay Hạ tầng Nhà mạng (ISP).',
    technicalContext: 'Traceroute sử dụng cơ chế tăng dần trường TTL (Time To Live) trong header IP từ 1, 2, 3... để nhận về thông điệp ICMP Time Exceeded từ từng Hop trên đường đi.',
    command: {
      cli: 'tracert -d -h 15 8.8.8.8',
      os: 'windows',
      description: 'Dò đường tối đa 15 hop tới 8.8.8.8 không tra cứu reverse DNS',
      sampleOutput: `Tracing route to 8.8.8.8 over a maximum of 15 hops:

  1    <1 ms    <1 ms    <1 ms  192.168.1.1
  2     1 ms    <1 ms     1 ms  10.0.0.1
  3     *        *        *     Request timed out.
  4     *        *        *     Request timed out.`,
      outputAnalysisGuide: 'Quan sát Hop cuối cùng có IP phản hồi: Nếu drop ngay sau Default Gateway (Hop 2 hoặc 3 thuộc dải IP nội bộ): Tường lửa chặn NAT hoặc lỗi định tuyến nội bộ. Nếu gói tin đã đi qua IP Public của Router ISP (vd: 118.69.x.x) rồi mới drop: Đứt cáp quang hoặc sự cố mạng ISP.',
      requiresElevation: false,
      timeoutSeconds: 45,
    },
    alternativeCommands: [
      {
        cli: 'traceroute -n -m 15 8.8.8.8',
        os: 'linux',
        description: 'Traceroute dạng số (không lookup DNS) trên Linux',
        sampleOutput: `traceroute to 8.8.8.8 (8.8.8.8), 15 hops max, 60 byte packets
 1  192.168.1.1  0.412 ms  0.380 ms  0.355 ms
 2  10.0.0.1  1.210 ms  1.189 ms  1.150 ms
 3  * * *`,
        outputAnalysisGuide: 'Hop 3 timeout -> Chặn tại tường lửa hoặc đứt kết nối biên WAN.',
      },
    ],
    branches: [
      {
        id: 'b-trace-firewall',
        label: 'Gói tin bị drop tại Hop nội bộ (Hop 1-2 là Gateway/Firewall nội bộ)',
        description: 'Chính sách Tường lửa (Security Policy/NAT) chặn luồng ra hoặc đường truyền WAN Lease Line bị ngắt.',
        nextNodeId: 'net-l4-firewall-escalate',
        badgeVariant: 'warning',
      },
      {
        id: 'b-trace-isp',
        label: 'Gói tin đã vượt qua Router biên công ty nhưng drop tại các trạm của ISP',
        description: 'Sự cố diện rộng của Nhà cung cấp dịch vụ Internet (VNPT / Viettel / FPT NOC).',
        nextNodeId: 'net-l3-isp-outage-escalate',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l4-firewall-escalate': {
    id: 'net-l4-firewall-escalate',
    kind: 'escalation',
    osiLayer: 'L4',
    title: 'Chuyển Tuyến SecOps/Firewall: Lỗi Policy NAT hoặc Cổng WAN Bị Chặn',
    description: 'Chuyển sự cố tới Đội Quản trị Tường lửa (Fortinet/Palo Alto/pfSense) để kiểm tra Rule Outbound và bảng Session Table.',
    branches: [],
    escalationDetails: {
      targetTier: 'Security Ops (SOC)',
      priority: 'P2 - High',
      contactChannel: 'Slack #secops-firewall',
      requiredInfo: [
        'IP máy trạm và Subnet nguồn',
        'Hình ảnh hoặc văn bản kết quả lệnh traceroute',
        'Cổng dịch vụ đang cố gắng truy cập (ICMP, Port 80, 443)',
      ],
      suggestedRemediation: 'Kiểm tra traffic log trên Firewall theo IP nguồn. Kiểm tra xem IP có rơi vào diện vi phạm chính sách bảo mật (Deny Policy) hoặc chứng chỉ SSL inspection bị lỗi.',
    },
  },

  'net-l3-isp-outage-escalate': {
    id: 'net-l3-isp-outage-escalate',
    kind: 'escalation',
    osiLayer: 'L3',
    title: 'Chuyển Tuyến NOC ISP: Sự Cố Đứt Tuyến Cáp Quang Nhà Mạng',
    description: 'Báo cáo sự cố đường truyền trực tiếp cho Trung tâm Vận hành Mạng của Nhà mạng cung cấp đường truyền Internet (ISP NOC).',
    branches: [],
    escalationDetails: {
      targetTier: 'ISP NOC',
      priority: 'P1 - Critical',
      contactChannel: 'Hotline ISP NOC & Email hỗ trợ khách hàng doanh nghiệp',
      requiredInfo: [
        'Mã hợp đồng đường truyền cáp quang / Mã mạch (Circuit ID)',
        'Địa chỉ IP tĩnh WAN doanh nghiệp được cấp',
        'Thời điểm bắt đầu mất tín hiệu và bảng Traceroute ghi nhận',
        'Trạng thái đèn tín hiệu (LOS / PON) trên modem/converter quang',
      ],
      suggestedRemediation: 'Yêu cầu ISP NOC kiểm tra tín hiệu suy hao quang (Optical Power) và đo kiểm tuyến cáp từ OLT tới địa điểm văn phòng.',
    },
  },

  // ----------------------------------------------------------------------------
  // TẦNG L7: PHÂN GIẢI TÊN MIỀN (DNS) & ỨNG DỤNG WEB
  // ----------------------------------------------------------------------------
  'net-l7-dns-resolution': {
    id: 'net-l7-dns-resolution',
    kind: 'diagnostic_step',
    osiLayer: 'L7',
    title: 'Kiểm tra Phân giải Tên miền DNS (nslookup)',
    description: 'Kiểm tra xem máy chủ DNS có dịch được tên miền (google.com hoặc tên miền nội bộ công ty) thành địa chỉ IP hay không.',
    technicalContext: 'Trình duyệt web và ứng dụng phần mềm luôn sử dụng tên miền (FQDN) thay vì gõ IP trực tiếp. Nếu ping được 8.8.8.8 nhưng nslookup thất bại, máy tính hoàn toàn tê liệt truy cập web do không giải mã được tên miền.',
    command: {
      cli: 'nslookup google.com',
      os: 'windows',
      description: 'Tra cứu bản ghi A của tên miền google.com qua máy chủ DNS mặc định',
      sampleOutput: `Server:  corp-dc01.corp.internal
Address:  192.168.1.10

Non-authoritative answer:
Name:    google.com
Addresses:  2404:6800:4005:810::200e
          142.250.204.46`,
      outputAnalysisGuide: 'Nếu xuất hiện dòng "Addresses: ..." với IP cụ thể: Phân giải DNS hoàn toàn tốt! Nếu nhận lỗi "DNS request timed out" hoặc "Server failure", DNS Server đang gặp sự cố.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'dig +short google.com',
        os: 'linux',
        description: 'Tra cứu DNS siêu nhanh bằng dig trên Linux',
        sampleOutput: `142.250.204.46`,
        outputAnalysisGuide: 'Nếu không trả về IP nào, kiểm tra file /etc/resolv.conf.',
      },
    ],
    branches: [
      {
        id: 'b-dns-ok',
        label: 'Phân giải tên miền thành công (Trả về đúng IP)',
        description: 'Dịch vụ DNS hoạt động hoàn hảo. Kiểm tra bước cuối cùng: Tải trang web HTTPS.',
        nextNodeId: 'net-l7-curl-http',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-dns-timeout',
        label: 'DNS request timed out / Server failure / Non-existent domain',
        description: 'Máy chủ DNS không phản hồi hoặc cache DNS cục bộ bị nhiễm độc/lỗi thời.',
        nextNodeId: 'net-l7-dns-flush-change',
        badgeVariant: 'danger',
      },
    ],
  },

  'net-l7-dns-flush-change': {
    id: 'net-l7-dns-flush-change',
    kind: 'action_required',
    osiLayer: 'L7',
    title: 'Xóa Cache DNS (Flush DNS) & Cấu hình DNS Dự Phòng',
    description: 'Dọn sạch bộ nhớ đệm DNS Client trên máy và thử nghiệm phân giải qua máy chủ Public DNS (8.8.8.8 / 1.1.1.1).',
    technicalContext: 'Bộ nhớ đệm DNS cục bộ có thể chứa các bản ghi bị lỗi (Negative Cache) hoặc máy chủ DNS nội bộ (Active Directory DNS) tạm thời bị nghẽn truy vấn.',
    command: {
      cli: 'ipconfig /flushdns && nslookup google.com 8.8.8.8',
      os: 'windows',
      description: 'Xóa cache DNS máy trạm và ép tra cứu trực tiếp qua máy chủ Google DNS 8.8.8.8',
      sampleOutput: `Successfully flushed the DNS Resolver Cache.

Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    google.com
Addresses:  142.250.204.46`,
      outputAnalysisGuide: 'Nếu tra cứu qua 8.8.8.8 thành công nhưng dùng DNS nội bộ thất bại: Máy chủ DNS nội bộ công ty đang bị lỗi hoặc chặn forwarder.',
      requiresElevation: true,
    },
    alternativeCommands: [
      {
        cli: 'resolvectl flush-caches && dig @8.8.8.8 google.com +short',
        os: 'linux',
        description: 'Xóa cache systemd-resolved và tra cứu qua 8.8.8.8 trên Linux',
        sampleOutput: `142.250.204.46`,
        outputAnalysisGuide: 'DNS 8.8.8.8 phản hồi bình thường.',
      },
    ],
    branches: [
      {
        id: 'b-dns-fixed-public',
        label: 'Sau khi Flush & gán DNS dự phòng, máy đã phân giải tên miền tốt',
        description: 'Sự cố được khắc phục tạm thời bằng DNS dự phòng.',
        nextNodeId: 'net-resolved-dns-fixed',
        badgeVariant: 'success',
      },
      {
        id: 'b-dns-internal-dead',
        label: 'Tra cứu qua 8.8.8.8 được nhưng DNS nội bộ (AD DS) bị tê liệt hoàn toàn',
        description: 'Không vào được các trang nội bộ (.corp.internal, portal nội bộ, file server).',
        nextNodeId: 'net-l7-internal-dns-escalate',
        badgeVariant: 'warning',
      },
    ],
  },

  'net-l7-internal-dns-escalate': {
    id: 'net-l7-internal-dns-escalate',
    kind: 'escalation',
    osiLayer: 'L7',
    title: 'Chuyển Tuyến L3: Máy Chủ Internal DNS / Domain Controller Bị Sự Cố',
    description: 'Dịch vụ DNS trên máy chủ Active Directory Domain Controller không phản hồi hoặc mất kết nối vùng phân giải (Zone transfer / Forwarders hỏng).',
    branches: [],
    escalationDetails: {
      targetTier: 'L3 Systems',
      priority: 'P1 - Critical',
      contactChannel: 'Slack #ad-sysadmin-team',
      requiredInfo: [
        'Địa chỉ IP của máy chủ DNS nội bộ gặp sự cố',
        'Thông báo lỗi chi tiết khi gõ `nslookup intranet.corp.internal <DNS_IP>`',
        'Phạm vi ảnh hưởng: Người dùng có đăng nhập được vào máy tính miền (Domain Join) không',
      ],
      suggestedRemediation: 'Khởi động lại dịch vụ DNS Server (`Restart-Service DNS`) trên Domain Controller. Kiểm tra Event Viewer DNS Server log tìm mã lỗi 4015 hoặc 4004. Kiểm tra cấu hình DNS Forwarders tới 8.8.8.8 / 1.1.1.1.',
    },
  },

  'net-l7-curl-http': {
    id: 'net-l7-curl-http',
    kind: 'diagnostic_step',
    osiLayer: 'L7',
    title: 'Kiểm tra Truy cập Dịch vụ Web HTTPS (HTTP Handshake)',
    description: 'Gửi yêu cầu HTTP HEAD request tới trang web để kiểm tra quá trình bắt tay TCP, chứng chỉ bảo mật SSL/TLS và mã trạng thái HTTP phản hồi.',
    technicalContext: 'Dù mạng thông và DNS giải quyết tốt, kết nối web vẫn có thể bị chặn bởi Proxy xác thực doanh nghiệp (Proxy 407), Captive Portal Wi-Fi, hoặc phần mềm diệt virus kiểm duyệt SSL (SSL Inspection certificate mismatch).',
    command: {
      cli: 'curl -Iv https://www.google.com --connect-timeout 5',
      os: 'windows',
      description: 'Kiểm tra bắt tay kết nối HTTPS và mã trạng thái HTTP trả về',
      sampleOutput: `* Connected to www.google.com (142.250.204.36) port 443
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* Server certificate:
*  subject: CN=www.google.com
*  issuer: C=US; O=Google Trust Services; CN=GTS CA 1C3
> HEAD / HTTP/2
> Host: www.google.com
> User-Agent: curl/8.4.0
> Accept: */*
> 
< HTTP/2 200 
< content-type: text/html; charset=ISO-8859-1`,
      outputAnalysisGuide: 'Nhận được HTTP/2 200 hoặc HTTP/1.1 200/301: Đường truyền Internet và Web hoàn toàn thông suốt! Nếu nhận lỗi "SSL certificate problem" hoặc "Proxy Authentication Required (407)", xem xét chuyển tuyến.',
      requiresElevation: false,
    },
    alternativeCommands: [
      {
        cli: 'curl -Iv https://www.google.com --connect-timeout 5',
        os: 'linux',
        description: 'Kiểm tra HTTP handshake trên Linux',
        sampleOutput: `< HTTP/2 200\n< content-type: text/html; charset=ISO-8859-1`,
        outputAnalysisGuide: 'HTTP 200 OK.',
      },
    ],
    branches: [
      {
        id: 'b-http-ok',
        label: 'HTTP/2 200 OK - Tải trang web thành công mượt mà',
        description: 'Tất cả các tầng từ L1 đến L7 đã thông suốt.',
        nextNodeId: 'net-resolved-full-connectivity',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-http-proxy-ssl',
        label: 'Lỗi Proxy 407 / Báo lỗi SSL Certificate Untrusted / Captive Portal',
        description: 'Bị chặn bởi Proxy nội bộ hoặc thiếu Root CA nội bộ.',
        nextNodeId: 'net-l7-proxy-ssl-escalate',
        badgeVariant: 'warning',
      },
    ],
  },

  'net-l7-proxy-ssl-escalate': {
    id: 'net-l7-proxy-ssl-escalate',
    kind: 'escalation',
    osiLayer: 'L7',
    title: 'Chuyển Tuyến SecOps: Xác Thực Proxy Thất Bại hoặc Lỗi Chứng Chỉ SSL',
    description: 'Chuyển ticket cho Quản trị Tường lửa/Proxy để kiểm tra tài khoản xác thực người dùng hoặc cài lại chứng chỉ Enterprise Root CA.',
    branches: [],
    escalationDetails: {
      targetTier: 'Security Ops (SOC)',
      priority: 'P3 - Medium',
      contactChannel: 'Slack #secops-help',
      requiredInfo: [
        'Tên đăng nhập Active Directory của người dùng',
        'Địa chỉ trang web cụ thể bị chặn hoặc báo lỗi mã chứng chỉ SSL',
        'Log curl chi tiết hiển thị mã lỗi (ví dụ: HTTP 407 Proxy Authentication Required)',
      ],
      suggestedRemediation: 'Kiểm tra chính sách Active Directory Group Policy (GPO) tự động phân phối chứng chỉ Root CA vào máy trạm. Mở khóa tài khoản người dùng trên hệ thống Proxy/Zscaler/FortiGate.',
    },
  },

  // ----------------------------------------------------------------------------
  // CÁC ĐIỂM KẾT THÚC THÀNH CÔNG (RESOLVED TERMINALS)
  // ----------------------------------------------------------------------------
  'net-resolved-dns-fixed': {
    id: 'net-resolved-dns-fixed',
    kind: 'resolved',
    osiLayer: 'L7',
    title: 'Sự Cố Đã Giải Quyết: Phục Hồi Kết Nối Bằng DNS Fallback',
    description: 'Kỹ thuật viên đã xóa thành công bộ nhớ đệm DNS bị nhiễm lỗi và chuyển hướng phân giải sang máy chủ DNS phụ/công cộng hoạt động ổn định.',
    branches: [],
    resolutionSummary: 'Đã xử lý xong sự cố phân giải tên miền bằng ipconfig /flushdns và gán cấu hình DNS fallback.',
    resolutionDetails: {
      rootCause: 'Bộ nhớ đệm DNS cục bộ (DNS Resolver Cache) chứa bản ghi hỏng hoặc máy chủ DNS sơ cấp gặp sự cố tạm thời.',
      remedyAction: 'Chạy ipconfig /flushdns và thiết lập DNS Server phụ (8.8.8.8, 1.1.1.1).',
      verificationChecklist: [
        'Lệnh nslookup google.com phản hồi đúng IP trong vòng < 50ms',
        'Người dùng mở trình duyệt vào được các ứng dụng web thông thường',
      ],
      preventativeMeasures: [
        'Cấu hình tự động cấp phát đồng thời 2 địa chỉ DNS (Primary & Secondary) qua DHCP Option 006.',
      ],
    },
  },

  'net-resolved-full-connectivity': {
    id: 'net-resolved-full-connectivity',
    kind: 'resolved',
    osiLayer: 'L7',
    title: 'Sự Cố Đã Giải Quyết: Toàn Bộ Hạ Tầng Mạng Hoạt Động Hoàn Hảo',
    description: 'Hệ thống đã kiểm tra thông suốt toàn bộ 5 tầng chẩn đoán: Cáp mạng L1 -> Cấu hình IP/DHCP L2 -> Gateway L3 -> Định tuyến WAN L3 -> DNS & Web L7.',
    branches: [],
    resolutionSummary: 'Kiểm tra toàn diện đạt chuẩn 100%: Mạng nội bộ, WAN, DNS và kết nối Web HTTPS hoạt động hoàn hảo.',
    resolutionDetails: {
      rootCause: 'Không phát hiện sự cố mạng phần cứng hoặc dịch vụ hạ tầng. Sự cố trước đó có thể do gián đoạn phiên kết nối tức thời hoặc người dùng mở sai đường dẫn.',
      remedyAction: 'Chẩn đoán và xác minh hoàn tất theo quy trình ITIL L1-L3.',
      verificationChecklist: [
        'Ping Gateway: 0% loss, < 1ms',
        'Ping Public DNS 8.8.8.8: 0% loss, < 30ms',
        'nslookup phân giải chuẩn xác',
        'HTTP/2 200 OK khi tải trang web',
      ],
      preventativeMeasures: [
        'Lưu vết phiên chẩn đoán vào hồ sơ IT Support để đối chiếu nếu có tái phát.',
      ],
    },
  },
};

/**
 * Đối tượng Runbook chuẩn hóa xuất khẩu chính thức.
 */
export const networkRunbook: Runbook = {
  id: 'network-l1-l3',
  title: 'Chẩn Đoán Sự Cố Mạng Nội Bộ & Internet (Network L1-L3/L7)',
  description: 'Cây quyết định tiêu chuẩn ITIL giúp kỹ thuật viên Helpdesk và Network Admin khoanh vùng sự cố mạng theo mô hình đáy lên (Bottom-Up) từ tầng vật lý đến ứng dụng web.',
  category: 'network',
  version: '1.0.0',
  estimatedMinutes: 5,
  targetAudience: 'Helpdesk L1, Network Support L2, Onsite IT Techs',
  startNodeId: 'net-l1-cable-check',
  nodes,
  tags: ['network', 'icmp', 'dhcp', 'gateway', 'dns', 'wan', 'traceroute', 'itil'],
  updatedAt: '2026-09-11T21:00:00.000Z',
};
