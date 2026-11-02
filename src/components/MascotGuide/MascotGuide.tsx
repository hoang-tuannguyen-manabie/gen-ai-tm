import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import style from './MascotGuide.module.css';

export interface GuideStep {
    id: string;
    badge: string;
    title: string;
    areaName: string;
    description: string;
    howToUse: string[];
    tip: string;
    gif: string;
    targetSelector: string | null;
    revealColumns?: boolean;
}

const HOME_STEPS_VI: GuideStep[] = [
    {
        id: 'home-welcome',
        badge: 'Bước 1 / 5 • Giới thiệu',
        title: 'Chào mừng bạn! Mình là Mana 👋',
        areaName: 'Giới thiệu & Tài liệu học tập',
        description:
            'Đây là GenAI Teachable Machine — nền tảng giúp bạn tự tay huấn luyện Trí tuệ nhân tạo (AI) nhận diện hình ảnh, tư thế, cử chỉ tay và âm thanh ngay trên trình duyệt mà không cần viết code!',
        howToUse: [
            'Nhấn "Tài liệu giảng dạy" để xem giáo án và bài tập mẫu.',
            'Nhấn "GitHub" để xem mã nguồn mở của dự án.',
            'Mọi dữ liệu camera/micro đều xử lý trực tiếp trên máy của bạn, đảm bảo an toàn và riêng tư.',
        ],
        tip: 'Mẹo: Bạn có thể nhấn vào từng số bước bên dưới để Mana nhảy tới chỉ dẫn ngay phần đó!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: '[data-tour="home-header"]',
    },
    {
        id: 'home-lang',
        badge: 'Bước 2 / 5 • Ngôn ngữ',
        title: 'Chuyển đổi Ngôn ngữ (Tiếng Việt & 16+ ngôn ngữ)',
        areaName: 'Menu Ngôn ngữ (Góc phải trên)',
        description:
            'Khu vực này cho phép bạn thay đổi ngôn ngữ hiển thị của toàn bộ trang web sang Tiếng Việt, Tiếng Anh, Tiếng Nhật, Tiếng Hàn và nhiều ngôn ngữ khác.',
        howToUse: [
            'Nhấn vào hộp chọn ngôn ngữ ở góc phải phía trên màn hình.',
            'Chọn "Tiếng Việt" để toàn bộ nút bấm, nhãn lớp và hướng dẫn chuyển sang Tiếng Việt.',
        ],
        tip: 'Mẹo: Lựa chọn ngôn ngữ của bạn sẽ được tự động ghi nhớ cho các lần truy cập sau!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-tour="home-lang"]',
    },
    {
        id: 'home-models',
        badge: 'Bước 3 / 5 • Chọn Mô hình AI',
        title: 'Khám phá 4 Loại Mô hình AI',
        areaName: 'Danh sách 4 Bộ phân loại AI',
        description:
            'Tại đây bạn chọn loại giác quan AI mà mình muốn huấn luyện. Mỗi thẻ tương ứng với một bài toán nhận diện khác nhau:',
        howToUse: [
            '🖼️ Bộ phân loại hình ảnh: Nhận diện đồ vật, khuôn mặt, màu sắc, thẻ bài qua Webcam hoặc ảnh tải lên.',
            '🕺 Bộ phân loại tư thế (Pose): Nhận diện dáng đứng, động tác tập thể dục qua khung xương cơ thể.',
            '✋ Bộ phân loại cử chỉ tay (Hand): Nhận diện ký hiệu bàn tay, ngón tay (kéo-búa-bao, ngôn ngữ ký hiệu).',
            '🎙️ Bộ phân loại âm thanh (Speech): Nhận diện giọng nói, từ khóa hoặc tiếng động qua Micro.',
        ],
        tip: 'Mẹo: Nếu mới bắt đầu, hãy thử "Bộ phân loại hình ảnh" hoặc "Bộ phân loại cử chỉ tay" trước nhé!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-tour="home-models"]',
    },
    {
        id: 'home-usb',
        badge: 'Bước 4 / 5 • Thiết bị ngoại vi',
        title: 'Kết nối phần cứng qua cổng USB Serial',
        areaName: 'Tùy chọn hỗ trợ thiết bị USB',
        description:
            'Nếu bạn muốn kết nối mô hình AI với mạch điều khiển phần cứng (như BBC micro:bit, Arduino) để bật đèn, quay động cơ khi AI nhận diện trúng, hãy chú ý tùy chọn này.',
        howToUse: [
            'Tích chọn ô "Cho phép sử dụng các thiết bị USB" trước khi vào mô hình (trên trình duyệt Chrome/Edge).',
            'Sau khi huấn luyện xong, bạn có thể gửi tín hiệu trực tiếp qua cáp USB tới mạch điện tử.',
        ],
        tip: 'Mẹo: Nếu chỉ thực hành trên máy tính bình thường, bạn có thể để trống ô này.',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-tour="home-usb"]',
    },
    {
        id: 'home-start',
        badge: 'Bước 5 / 5 • Bắt đầu',
        title: 'Sẵn sàng tiến vào Phòng thí nghiệm AI! 🚀',
        areaName: 'Nút "Tạo mới" trên các thẻ mô hình',
        description:
            'Bây giờ bạn đã nắm rõ trang chủ rồi! Khi vào bên trong không gian huấn luyện, Mana sẽ tiếp tục đi theo và chiếu sáng từng cột chức năng để hướng dẫn bạn.',
        howToUse: [
            'Nhấn nút "Tạo mới" (Create) màu xanh trên một trong 4 thẻ mô hình ở đây.',
            'Hoặc nhấn biểu tượng Mana ở góc dưới bất cứ lúc nào nếu bạn muốn xem lại hướng dẫn này.',
        ],
        tip: 'Chúc bạn tạo ra những mô hình AI thật thú vị! Hãy nhấn vào một mô hình để bắt đầu nhé!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-tour="home-models"]',
    },
];

const HOME_STEPS_EN: GuideStep[] = [
    {
        id: 'home-welcome',
        badge: 'Step 1 / 5 • Welcome',
        title: 'Hi there! I am Mana, your AI Guide 👋',
        areaName: 'Header & Teaching Materials',
        description:
            'Welcome to GenAI Teachable Machine — an interactive workspace where you can train AI models to recognize images, body poses, hand gestures, and sounds right in your browser!',
        howToUse: [
            'Click "Teaching materials" for lesson plans and classroom activities.',
            'Click "GitHub" to inspect the open-source repository.',
            'All webcam and microphone data stays locally on your device for full privacy.',
        ],
        tip: 'Tip: Click any step number below to make Mana jump and spotlight that exact section!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: '[data-tour="home-header"]',
    },
    {
        id: 'home-lang',
        badge: 'Step 2 / 5 • Language',
        title: 'Switch Interface Language',
        areaName: 'Language Selector (Top Right)',
        description:
            'Use this dropdown to switch the entire application interface between Vietnamese, English, and 15+ other languages.',
        howToUse: [
            'Click the language selector at the top-right corner.',
            'Pick your preferred language and the UI updates immediately.',
        ],
        tip: 'Tip: Your language preference is automatically saved for future visits.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-tour="home-lang"]',
    },
    {
        id: 'home-models',
        badge: 'Step 3 / 5 • Choose AI Model',
        title: 'Explore the 4 AI Classifier Types',
        areaName: 'Model Selection Cards',
        description:
            'Choose what kind of sensory data you want your AI model to learn from:',
        howToUse: [
            '🖼️ Image Classifier: Recognize objects, faces, or cards via Webcam or uploaded photos.',
            '🕺 Pose Classifier: Recognize body postures and movements using skeletal keypoints.',
            '✋ Hand Gesture Classifier: Recognize hand signs and finger poses (rock-paper-scissors, sign language).',
            '🎙️ Speech Classifier: Recognize spoken words or background sounds via Microphone.',
        ],
        tip: 'Tip: Starting with "Image Classifier" or "Hand Gesture Classifier" is super fun and easy!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-tour="home-models"]',
    },
    {
        id: 'home-usb',
        badge: 'Step 4 / 5 • Hardware USB',
        title: 'Connect USB Serial Devices',
        areaName: 'USB Device Option',
        description:
            'Want your AI to control physical hardware like a BBC micro:bit or Arduino? Enable USB Serial support here.',
        howToUse: [
            'Check "Allow use of USB devices" before launching your classifier.',
            'Trigger hardware outputs directly when your AI detects a class.',
        ],
        tip: 'Tip: You can leave this unchecked if you are only testing on your computer.',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-tour="home-usb"]',
    },
    {
        id: 'home-start',
        badge: 'Step 5 / 5 • Get Started',
        title: 'Ready to Enter the AI Workspace! 🚀',
        areaName: '"Create" Button on Model Cards',
        description:
            'Once you enter a model workspace, Mana will spotlight each of the 5 workflow columns and show you how to collect data, train, test, and add actions.',
        howToUse: [
            'Click the "Create" button on any of the 4 model cards above.',
            'Click the floating Mana button anytime you want to replay this tour.',
        ],
        tip: 'Let’s click a model card and build your first AI together!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-tour="home-models"]',
    },
];

const WORKSPACE_STEPS_VI: GuideStep[] = [
    {
        id: 'ws-overview',
        badge: 'Bước 1 / 10 • Tổng quan',
        title: 'Chào mừng vào Phòng Huấn luyện AI! 🤖',
        areaName: 'Quy trình 5 cột từ Trái sang Phải',
        description:
            'Không gian làm việc được thiết kế theo dòng chảy tự nhiên từ trái sang phải gồm 5 phần: (1) Dữ liệu mẫu ➔ (2) Huấn luyện ➔ (3) Kiểm thử & Giải thích AI ➔ (4) Hành động ➔ (5) Đầu ra. Hãy cùng Mana đi qua từng khu vực nhé!',
        howToUse: [
            'Nhấn "Phần tiếp theo" để Mana chiếu sáng (spotlight) và giải thích chi tiết từng khối trên màn hình.',
            'Bạn có thể nhấn trực tiếp vào các nút số 1..10 để xem nhanh phần mình cần.',
            'Khi đến bước Hành động (9) và Đầu ra (10), Mana sẽ tự động mở rộng toàn bộ 5 cột để bạn quan sát!',
        ],
        tip: 'Mẹo: Bạn vẫn có thể thao tác trực tiếp lên giao diện ngay cả khi Mana đang hướng dẫn!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: null,
        revealColumns: false,
    },
    {
        id: 'ws-training-data',
        badge: 'Bước 2 / 10 • Cột 1: Dữ liệu',
        title: 'Khu vực Dữ liệu Huấn luyện (Training Data)',
        areaName: 'Cột 1 — Danh sách các Lớp (Classes)',
        description:
            'Đây là nơi bạn gom các ví dụ mẫu để dạy cho AI. Mỗi "Lớp" (Class) đại diện cho một nhóm đối tượng hoặc trạng thái mà bạn muốn máy tính phân biệt được.',
        howToUse: [
            'Mặc định hệ thống tạo sẵn Lớp 1 và Lớp 2 (với âm thanh sẽ có thêm lớp Tiếng ồn nền).',
            'Cung cấp dữ liệu mẫu cho ít nhất 2 lớp để máy có thể học cách so sánh sự khác biệt.',
            'Số lượng mẫu đã thu thập của mỗi lớp sẽ hiển thị rõ ràng bên trong thẻ lớp đó.',
        ],
        tip: 'Mẹo: Các lớp có số lượng mẫu cân bằng nhau (ví dụ mỗi lớp 30 mẫu) sẽ giúp AI học chuẩn xác hơn!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: 'section[aria-labelledby="training-data-header"]',
        revealColumns: false,
    },
    {
        id: 'ws-class-card',
        badge: 'Bước 3 / 10 • Thao tác Thẻ Lớp',
        title: 'Cách thu thập mẫu trong một Thẻ Lớp',
        areaName: 'Thẻ Lớp 1 (Đổi tên, Webcam, Tải ảnh & Menu)',
        description:
            'Bên trong mỗi thẻ lớp có đầy đủ công cụ để bạn đặt tên nhãn và đưa dữ liệu mẫu vào:',
        howToUse: [
            '✏️ Đổi tên lớp: Nhấn trực tiếp vào chữ "Lớp 1" ở đầu thẻ để đặt tên dễ nhớ (VD: "Giơ tay", "Vẫy tay").',
            '📷 Nút Webcam / Micro: Nhấn mở camera, sau đó NHẤN GIỮ nút thu để chụp liên tục 20–50 mẫu ở nhiều góc độ.',
            '📁 Nút Tải lên (Upload): Kéo thả ảnh/tệp từ máy tính vào, hoặc quét Mã QR để dùng điện thoại chụp mẫu gửi sang!',
            '⋮ Menu góc phải thẻ: Xóa toàn bộ mẫu cũ, xóa lớp hoặc tải bộ mẫu về máy.',
        ],
        tip: 'Mẹo: Khi chụp mẫu bằng Webcam, hãy hơi nghiêng đầu hoặc đổi khoảng cách một chút để AI nhận diện tốt trong mọi hoàn cảnh!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '#class-0',
        revealColumns: false,
    },
    {
        id: 'ws-add-class',
        badge: 'Bước 4 / 10 • Mở rộng Lớp',
        title: 'Thêm Lớp phân loại mới (+ Thêm lớp)',
        areaName: 'Nút "+ Thêm lớp" (Cuối cột Dữ liệu)',
        description:
            'Bạn không bị giới hạn ở 2 lớp! Nếu muốn dạy AI nhận biết 3, 4 hoặc nhiều đối tượng khác nhau (ví dụ: Kéo, Búa, Bao), hãy dùng nút này.',
        howToUse: [
            'Nhấn vào nút "+ Thêm lớp" để tạo thêm Lớp 3, Lớp 4...',
            'Lặp lại thao tác đặt tên và thu thập mẫu cho lớp vừa tạo.',
        ],
        tip: 'Mẹo: Bạn có thể tạo bao nhiêu lớp tùy thích tùy theo bài toán sáng tạo của mình!',
        gif: '/mascot/mana_dong_di.gif',
        targetSelector: '[data-testid="addClass"]',
        revealColumns: false,
    },
    {
        id: 'ws-trainer',
        badge: 'Bước 5 / 10 • Cột 2: Huấn luyện',
        title: 'Huấn luyện Mô hình & Thông số Nâng cao',
        areaName: 'Cột 2 — Khối Huấn luyện (Training)',
        description:
            'Sau khi đã có dữ liệu mẫu ở các lớp, đây là "bộ não" nơi thuật toán Học máy (Machine Learning) phân tích đặc trưng và học cách phân loại.',
        howToUse: [
            '🚀 Nhấn nút "Huấn luyện" (Train): Chờ vài giây để thanh tiến trình chạy đến 100%.',
            '⚙️ Mở mục "Nâng cao" (Advanced) nếu muốn tinh chỉnh sâu:',
            '   • Chu kỳ (Epochs): Số vòng máy học đi học lại toàn bộ dữ liệu (mặc định 50).',
            '   • Tốc độ học (Learning Rate): Bước nhảy điều chỉnh trọng số mạng nơ-ron.',
            '   • Kích thước lô (Batch Size): Số mẫu đưa vào xử lý trong mỗi lượt.',
        ],
        tip: 'Mẹo: Bất cứ khi nào bạn thêm hoặc xóa mẫu ở Cột 1, hãy nhấn "Huấn luyện" lại để cập nhật mô hình nhé!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-widget="trainer"]',
        revealColumns: false,
    },
    {
        id: 'ws-input',
        badge: 'Bước 6 / 10 • Cột 3: Đầu vào thử nghiệm',
        title: 'Chọn Nguồn Dữ liệu Kiểm thử (Input)',
        areaName: 'Cột 3 (Trên) — Khối Đầu vào (Input)',
        description:
            'Khi mô hình đã học xong, khu vực này cung cấp dữ liệu thực tế theo thời gian thực để kiểm tra xem AI đoán đúng hay sai.',
        howToUse: [
            '🔘 Công tắc Bật / Tắt: Tạm dừng hoặc bật luồng dữ liệu đầu vào bất cứ lúc nào.',
            '📷 Webcam / Micro: Thử nghiệm trực tiếp trước ống kính camera hoặc giọng nói của bạn.',
            '🖼️ Tệp / Bộ dữ liệu (File / Dataset): Chọn ảnh hoặc tệp có sẵn trên máy để kiểm tra.',
            '📱 Thiết bị (Device): Quét mã QR để dùng camera điện thoại làm đầu vào từ xa!',
        ],
        tip: 'Mẹo: Hãy thử đưa một vật thể ở góc chụp mới chưa từng có trong dữ liệu mẫu để xem AI thông minh thế nào!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-widget="input"]',
        revealColumns: false,
    },
    {
        id: 'ws-preview',
        badge: 'Bước 7 / 10 • Cột 3: Dự đoán & Xuất',
        title: 'Xem trước Độ tự tin & Chia sẻ Mô hình (Preview)',
        areaName: 'Cột 3 (Giữa) — Khối Xem trước kết quả',
        description:
            'Hiển thị kết quả dự đoán trực tiếp của AI dưới dạng các thanh phần trăm độ tự tin (0% – 100%) cho từng lớp.',
        howToUse: [
            '📊 Quan sát thanh màu: Lớp nào có thanh phần trăm cao nhất là kết quả AI đang chọn.',
            '📤 Nút Xuất / Chia sẻ (biểu tượng mũi tên góc phải):',
            '   • Tạo đường dẫn chia sẻ hoặc mã nhúng cho dự án.',
            '   • Tải xuống tệp mô hình TensorFlow.js để lập trình web/app riêng.',
            '   • Sao chép liên kết mô hình để dùng trong Scratch hoặc ứng dụng khác.',
        ],
        tip: 'Mẹo: Nếu thanh kết quả bị nhảy liên tục giữa 2 lớp, hãy bổ sung thêm mẫu đa dạng cho 2 lớp đó rồi huấn luyện lại!',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-widget="model"]',
        revealColumns: false,
    },
    {
        id: 'ws-xai',
        badge: 'Bước 8 / 10 • Giải thích AI (XAI)',
        title: 'Khám phá "Bên trong hộp đen AI" (Statistics & Heatmap)',
        areaName: 'Cột 3 (Dưới) — Bộ công cụ Giải thích AI',
        description:
            'Bộ 3 nút chuyên sâu giúp học sinh và giáo viên hiểu rõ tại sao AI lại đưa ra quyết định như vậy:',
        howToUse: [
            '📈 Statistics (Thống kê): Mở bảng phân tích độ chính xác trên từng lớp và ma trận nhầm lẫn.',
            '🔥 Heatmap (Bản đồ nhiệt): Hiển thị vùng màu nóng ngay trên hình ảnh để chỉ ra AI đang "nhìn" vào điểm nào để phán đoán!',
            '🕸️ Transfer Learning: Minh họa trực quan cách mạng nơ-ron trích xuất đặc trưng qua các tầng.',
        ],
        tip: 'Mẹo: Hãy bật Heatmap để kiểm tra xem AI đang nhìn đúng vào vật thể hay vô tình học nhầm phông nền phía sau nhé!',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-tour="xai-buttons"]',
        revealColumns: false,
    },
    {
        id: 'ws-behaviours',
        badge: 'Bước 9 / 10 • Cột 4: Hành động',
        title: 'Thiết lập Hành động Phản hồi (Actions)',
        areaName: 'Cột 4 — Khối Hành động (Behaviours)',
        description:
            'Biến mô hình AI thành ứng dụng tương tác thú vị! Bạn có thể quy định mỗi khi AI nhận diện trúng một lớp thì máy tính sẽ thực hiện hành động gì:',
        howToUse: [
            '💬 Văn bản (Text): Hiển thị câu thông báo, lời chào hoặc nhãn tùy chỉnh.',
            '🖼️ Hình ảnh (Image): Hiển thị hình minh họa, sticker hoặc biểu cảm tương ứng.',
            '🔊 Âm thanh (Audio): Phát nhạc MP3 hoặc tự ghi âm giọng nói phát ra loa (chọn phát 1 lần hoặc lặp lại).',
            '🔗 Nhúng / USB (Embed / Serial): Nhúng trang web/video hoặc gửi lệnh điều khiển ra mạch phần cứng.',
        ],
        tip: 'Mẹo: Kết hợp nhận diện cử chỉ tay + phát âm thanh để tạo ra nhạc cụ không chạm hoặc trợ lý ảo của riêng bạn!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: 'section[aria-labelledby="behaviours-title"]',
        revealColumns: true,
    },
    {
        id: 'ws-output',
        badge: 'Bước 10 / 10 • Cột 5: Đầu ra & Lưu trữ',
        title: 'Trình chiếu Đầu ra (Output) & Lưu Dự án',
        areaName: 'Cột 5 — Khối Đầu ra & Thanh Lưu/Mở trên cùng',
        description:
            'Cột cuối cùng là màn hình trình diễn sản phẩm hoàn chỉnh của bạn! Ngoài ra bạn có thể lưu toàn bộ công sức về máy tính.',
        howToUse: [
            '🖥️ Khung Đầu ra (Output): Xem trực tiếp hình ảnh, chữ và âm thanh kích hoạt khi AI nhận diện trúng.',
            '🗖 Các nút góc dưới Đầu ra: Bật/tắt tiếng, Phóng to cửa sổ trình chiếu, hoặc Triển khai (Deploy) qua mã QR.',
            '💾 Nút "Lưu" & "Mở" (Thanh trên cùng bên trái): Tải toàn bộ dự án (dữ liệu + mô hình + hành động) thành tệp .zip về máy để hôm sau mở lại học tiếp!',
        ],
        tip: 'Chúc mừng bạn đã hoàn thành chuyến tham quan cùng Mana! Nhấn "Hoàn tất" để bắt đầu sáng tạo ngay thôi! 🎉',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-widget="output"]',
        revealColumns: true,
    },
];

const WORKSPACE_STEPS_EN: GuideStep[] = [
    {
        id: 'ws-overview',
        badge: 'Step 1 / 10 • Overview',
        title: 'Welcome to the AI Training Studio! 🤖',
        areaName: '5-Column Left-to-Right Workflow',
        description:
            'This workspace flows naturally from left to right across 5 stages: (1) Training Data ➔ (2) Trainer ➔ (3) Input & Preview ➔ (4) Actions ➔ (5) Output. Let Mana spotlight each part for you!',
        howToUse: [
            'Click "Next Section" to spotlight and inspect each section on screen.',
            'Click any step number (1–10) to jump directly to that part of the workspace.',
            'When you reach Steps 9 & 10, Mana automatically reveals the Actions and Output columns for you!',
        ],
        tip: 'Tip: You can interact with buttons on the page even while the guide is open!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: null,
        revealColumns: false,
    },
    {
        id: 'ws-training-data',
        badge: 'Step 2 / 10 • Column 1: Data',
        title: 'Training Data Column',
        areaName: 'Column 1 — Classes & Samples',
        description:
            'This column holds all the example data you collect to teach your AI. Each "Class" represents a category you want the model to distinguish.',
        howToUse: [
            'Start with at least 2 classes (e.g., Class 1 and Class 2).',
            'Add example samples into each class so the AI can learn their differences.',
            'Keep sample counts balanced across classes for best accuracy.',
        ],
        tip: 'Tip: Aim for at least 20–30 diverse samples per class!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: 'section[aria-labelledby="training-data-header"]',
        revealColumns: false,
    },
    {
        id: 'ws-class-card',
        badge: 'Step 3 / 10 • Class Card Controls',
        title: 'Inside a Class Card: Rename, Webcam & Upload',
        areaName: 'Class 1 Card',
        description:
            'Every class card gives you flexible ways to label and collect training samples:',
        howToUse: [
            '✏️ Rename: Click the class title ("Class 1") to type a meaningful name.',
            '📷 Webcam / Mic button: Open the recorder and HOLD the record button to capture a burst of samples.',
            '📁 Upload button: Drag & drop files from your computer, or scan the QR code to send samples from a phone!',
            '⋮ Card Menu: Delete all samples, remove the class, or download samples.',
        ],
        tip: 'Tip: Vary angles, lighting, and background slightly while recording so your model generalizes well!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '#class-0',
        revealColumns: false,
    },
    {
        id: 'ws-add-class',
        badge: 'Step 4 / 10 • Add More Classes',
        title: 'Add New Classes (+ Add a class)',
        areaName: '"+ Add a class" Button',
        description:
            'Want your AI to recognize 3, 4, or more categories? Click this button at the bottom of the Training Data column.',
        howToUse: [
            'Click "+ Add a class" to create a new class card.',
            'Give it a label and record or upload samples just like the first two classes.',
        ],
        tip: 'Tip: You can add as many classes as your project needs!',
        gif: '/mascot/mana_dong_di.gif',
        targetSelector: '[data-testid="addClass"]',
        revealColumns: false,
    },
    {
        id: 'ws-trainer',
        badge: 'Step 5 / 10 • Column 2: Training',
        title: 'Train Your Model & Advanced Hyperparameters',
        areaName: 'Column 2 — Training Widget',
        description:
            'Once you have samples in at least 2 classes, this is where the neural network learns from your examples.',
        howToUse: [
            '🚀 Click "Train": Wait a few seconds while the progress bar reaches 100%.',
            '⚙️ Expand "Advanced" to experiment with hyperparameters:',
            '   • Epochs: Number of complete passes through the training dataset.',
            '   • Learning Rate: How quickly the model updates its weights.',
            '   • Batch Size: Number of samples processed per training step.',
        ],
        tip: 'Tip: Whenever you add or remove samples in Column 1, click "Train" again to update the model!',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-widget="trainer"]',
        revealColumns: false,
    },
    {
        id: 'ws-input',
        badge: 'Step 6 / 10 • Column 3: Test Input',
        title: 'Live Test Input Source',
        areaName: 'Column 3 (Top) — Input Widget',
        description:
            'Feed live or saved data into your trained model to test how well it performs in real time.',
        howToUse: [
            '🔘 On / Off Switch: Toggle the test input stream at any time.',
            '📷 Webcam / Microphone: Test live using your device camera or mic.',
            '🖼️ File / Dataset: Upload test images or pick from a dataset.',
            '📱 Device: Scan a QR code to stream test input from another phone or tablet!',
        ],
        tip: 'Tip: Test your model with new examples it did not see during training!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-widget="input"]',
        revealColumns: false,
    },
    {
        id: 'ws-preview',
        badge: 'Step 7 / 10 • Column 3: Preview & Export',
        title: 'Real-Time Confidence Bars & Model Export',
        areaName: 'Column 3 (Middle) — Preview Widget',
        description:
            'Watch real-time prediction probabilities (0% – 100%) for each class as your input changes.',
        howToUse: [
            '📊 Confidence Bars: The class with the highest percentage bar is the active prediction.',
            '📤 Export Button (top-right icon of Preview): Share your model link, export TensorFlow.js files, or copy URLs for Scratch and external apps.',
        ],
        tip: 'Tip: If confidence flickers between two classes, add more training samples for those classes and retrain.',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-widget="model"]',
        revealColumns: false,
    },
    {
        id: 'ws-xai',
        badge: 'Step 8 / 10 • Explainable AI (XAI)',
        title: 'Look Inside the AI: Statistics, Heatmap & Transfer Learning',
        areaName: 'Column 3 (Bottom) — Explainable AI Buttons',
        description:
            'These three tools open an interactive side panel to explain how and why your AI makes decisions:',
        howToUse: [
            '📈 Statistics: View per-class accuracy metrics and confusion matrices.',
            '🔥 Heatmap: Overlay a visual heatmap showing which pixels influenced the AI prediction the most!',
            '🕸️ Transfer Learning: Explore how deep neural network layers extract features.',
        ],
        tip: 'Tip: Open Heatmap to verify your AI is focusing on the subject and not memorizing the background!',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-tour="xai-buttons"]',
        revealColumns: false,
    },
    {
        id: 'ws-behaviours',
        badge: 'Step 9 / 10 • Column 4: Actions',
        title: 'Assign Automated Actions (Behaviours)',
        areaName: 'Column 4 — Actions Column',
        description:
            'Make your AI respond! Configure what should happen whenever a specific class is detected:',
        howToUse: [
            '💬 TextMessage: Display custom text on screen.',
            '🖼️ Image: Show an image or reaction graphic.',
            '🔊 Audio: Play an MP3 sound or record a voice clip (one-shot or looping).',
            '🔗 Embed / USB Serial: Embed external media or send serial triggers to USB hardware.',
        ],
        tip: 'Tip: Combine hand gestures with audio actions to build a touchless musical instrument!',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: 'section[aria-labelledby="behaviours-title"]',
        revealColumns: true,
    },
    {
        id: 'ws-output',
        badge: 'Step 10 / 10 • Column 5: Output & Saving',
        title: 'Live Output Stage & Saving Your Project',
        areaName: 'Column 5 — Output Widget & Top Save/Open Bar',
        description:
            'The Output column displays the active behaviour triggered by your AI, and the top bar lets you save your work.',
        howToUse: [
            '🖥️ Output Display: Watch your configured text, image, or sound trigger live.',
            '🗖 Bottom Controls: Mute/unmute audio, open Output in a full window, or Deploy to mobile via QR.',
            '💾 Save & Open (Top-Left AppBar): Download your entire project as a .zip file so you can reopen and continue anytime!',
        ],
        tip: 'Awesome job completing the tour with Mana! Click "Finish" and start building your AI! 🎉',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-widget="output"]',
        revealColumns: true,
    },
];

const STORAGE_KEY_PREFIX = 'genai_tm_mana_tour_v2_';

interface MascotGuideProps {
    mode?: 'home' | 'workspace';
    onRevealColumns?: (reveal: boolean) => void;
}

interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

type CardPlacement = 'right' | 'left' | 'bottom' | 'top' | 'center';

interface CardPositionStyle {
    top?: number;
    left?: number;
    placement: CardPlacement;
}

export default function MascotGuide({ mode = 'workspace', onRevealColumns }: MascotGuideProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    const steps = mode === 'home' ? (isVi ? HOME_STEPS_VI : HOME_STEPS_EN) : isVi ? WORKSPACE_STEPS_VI : WORKSPACE_STEPS_EN;
    const storageKey = `${STORAGE_KEY_PREFIX}${mode}`;

    const [isOpen, setIsOpen] = useState<boolean>(() => {
        try {
            return localStorage.getItem(storageKey) !== 'dismissed';
        } catch {
            return true;
        }
    });

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    const [cardPos, setCardPos] = useState<CardPositionStyle>({ placement: 'center' });
    const cardRef = useRef<HTMLDivElement | null>(null);

    const safeStepIndex = Math.min(currentStep, steps.length - 1);
    const step = steps[safeStepIndex];

    // Notify parent Classifier whether hidden columns (Behaviours / Output) should be revealed
    useEffect(() => {
        if (!onRevealColumns) return;
        onRevealColumns(Boolean(isOpen && step?.revealColumns));
    }, [isOpen, step, onRevealColumns]);

    const computeLayout = useCallback(
        (shouldScroll: boolean) => {
            if (!isOpen || !step) return;

            if (!step.targetSelector) {
                setSpotlightRect(null);
                setCardPos({ placement: 'center' });
                return;
            }

            const el = document.querySelector(step.targetSelector) as HTMLElement | null;
            if (!el) {
                setSpotlightRect(null);
                setCardPos({ placement: 'center' });
                return;
            }

            if (shouldScroll) {
                try {
                    el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    });
                } catch {
                    // ignore scroll errors in older environments
                }
            }

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                setSpotlightRect(null);
                setCardPos({ placement: 'center' });
                return;
            }

            const pad = 10;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Clamp spotlight inside visible viewport bounds so box-shadow cutout always looks crisp
            const spotTop = Math.max(8, rect.top - pad);
            const spotLeft = Math.max(8, rect.left - pad);
            const spotRight = Math.min(vw - 8, rect.right + pad);
            const spotBottom = Math.min(vh - 8, rect.bottom + pad);
            const spotWidth = Math.max(48, spotRight - spotLeft);
            const spotHeight = Math.max(48, spotBottom - spotTop);

            setSpotlightRect({
                top: spotTop,
                left: spotLeft,
                width: spotWidth,
                height: spotHeight,
            });

            // Determine optimal card position right next to the spotlighted element
            const cardWidth = Math.min(440, vw - 24);
            const cardHeight = cardRef.current?.offsetHeight || 430;
            const gap = 20;
            const margin = 14;

            const spaceRight = vw - spotRight - gap - margin;
            const spaceLeft = spotLeft - gap - margin;
            const spaceBottom = vh - spotBottom - gap - margin;
            const spaceTop = spotTop - gap - margin;

            let placement: CardPlacement = 'right';
            let top = margin;
            let left = margin;

            if (spaceRight >= cardWidth) {
                placement = 'right';
                left = spotRight + gap;
                top = spotTop + spotHeight / 2 - cardHeight / 2;
            } else if (spaceLeft >= cardWidth) {
                placement = 'left';
                left = spotLeft - gap - cardWidth;
                top = spotTop + spotHeight / 2 - cardHeight / 2;
            } else if (spaceBottom >= Math.min(cardHeight, 300)) {
                placement = 'bottom';
                top = spotBottom + gap;
                left = spotLeft + spotWidth / 2 - cardWidth / 2;
            } else if (spaceTop >= Math.min(cardHeight, 300)) {
                placement = 'top';
                top = spotTop - gap - cardHeight;
                left = spotLeft + spotWidth / 2 - cardWidth / 2;
            } else {
                // When target covers most of the screen (e.g., wide grid), dock smartly where it overlaps least
                placement = spotLeft > vw / 3 ? 'left' : 'right';
                left = placement === 'right' ? Math.max(margin, vw - cardWidth - margin) : margin;
                top = Math.max(margin, vh - cardHeight - margin);
            }

            // Clamp within viewport so the card is 100% visible
            left = Math.max(margin, Math.min(left, vw - cardWidth - margin));
            top = Math.max(margin, Math.min(top, vh - cardHeight - margin));

            setCardPos({
                top: Math.round(top),
                left: Math.round(left),
                placement,
            });
        },
        [isOpen, step]
    );

    // Recalculate when step or open state changes (with delayed passes to catch smooth scroll & column reveal)
    useEffect(() => {
        if (!isOpen) return;

        const t0 = window.setTimeout(() => computeLayout(true), 50);
        const t1 = window.setTimeout(() => computeLayout(false), 320);
        const t2 = window.setTimeout(() => computeLayout(false), 650);

        const handleUpdate = () => computeLayout(false);
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);

        return () => {
            window.clearTimeout(t0);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isOpen, safeStepIndex, step, computeLayout]);

    const handleClose = () => {
        setIsOpen(false);
        try {
            localStorage.setItem(storageKey, 'dismissed');
        } catch {
            // ignore storage errors
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore storage errors
        }
    };

    const handleNext = () => {
        if (safeStepIndex < steps.length - 1) {
            setCurrentStep(safeStepIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (safeStepIndex > 0) {
            setCurrentStep(safeStepIndex - 1);
        }
    };

    const handleRestart = () => {
        setCurrentStep(0);
    };

    if (!isOpen) {
        return (
            <div className={style.floatingContainer}>
                <button
                    type="button"
                    className={style.fabButton}
                    onClick={handleOpen}
                    title={isVi ? 'Bật Mana hướng dẫn từng phần' : 'Start Mana interactive spotlight guide'}
                    aria-label={isVi ? 'Mở trợ lý AI hướng dẫn' : 'Open AI onboarding guide'}
                >
                    <img
                        src="/mascot/mana_dong_cho.gif"
                        alt="Mana AI Mascot"
                        className={style.fabMascotImg}
                    />
                    <span className={style.fabText}>
                        ✨ {isVi ? 'Hướng dẫn từng phần (Mana)' : 'Interactive Guide (Mana)'}
                    </span>
                </button>
            </div>
        );
    }

    const isCentered = cardPos.placement === 'center' || !spotlightRect;

    return (
        <div
            className={style.tourLayer}
            role="dialog"
            aria-label={isVi ? 'Trợ lý Mana hướng dẫn sử dụng' : 'Mana Interactive Onboarding Tour'}
        >
            {/* Dark backdrop or Spotlight Cutout */}
            {spotlightRect ? (
                <div
                    className={style.spotlightBox}
                    style={{
                        top: `${spotlightRect.top}px`,
                        left: `${spotlightRect.left}px`,
                        width: `${spotlightRect.width}px`,
                        height: `${spotlightRect.height}px`,
                    }}
                >
                    <div className={style.spotlightBadge}>
                        <span>🎯 {step.areaName}</span>
                    </div>
                    <div className={style.spotlightPulse} />
                </div>
            ) : (
                <div className={style.fullBackdrop} />
            )}

            {/* Mana + Tour Speech Card positioned dynamically next to the focused section */}
            <div
                ref={cardRef}
                className={`${style.tourCardWrapper} ${isCentered ? style.tourCardCentered : style.tourCardFloating}`}
                style={
                    !isCentered
                        ? {
                              top: `${cardPos.top ?? 24}px`,
                              left: `${cardPos.left ?? 24}px`,
                          }
                        : undefined
                }
                data-placement={cardPos.placement}
            >
                <div className={style.guideCard}>
                    {/* Header */}
                    <div className={style.cardHeader}>
                        <div className={style.badgeGroup}>
                            <span className={style.stepBadge}>{step.badge}</span>
                            {spotlightRect && (
                                <span className={style.focusIndicator}>
                                    ✨ {isVi ? 'Đang chiếu sáng' : 'Spotlighting'}
                                </span>
                            )}
                        </div>
                        <div className={style.headerActions}>
                            <button
                                type="button"
                                className={style.iconBtn}
                                onClick={handleRestart}
                                title={isVi ? 'Xem lại từ bước 1' : 'Restart from step 1'}
                            >
                                ↺
                            </button>
                            <button
                                type="button"
                                className={style.iconBtn}
                                onClick={handleClose}
                                title={isVi ? 'Thu gọn hướng dẫn' : 'Minimize guide'}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Quick Jump Step Pills */}
                    <div className={style.stepPillsRow}>
                        {steps.map((s, idx) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`${style.stepPill} ${idx === safeStepIndex ? style.stepPillActive : ''} ${
                                    idx < safeStepIndex ? style.stepPillDone : ''
                                }`}
                                onClick={() => setCurrentStep(idx)}
                                title={`${idx + 1}. ${s.title}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Main Body with Animated GIF Mascot & Detailed Section Explanation */}
                    <div className={style.cardBody}>
                        <div className={style.mascotColumn}>
                            <div className={style.mascotStage}>
                                <img
                                    key={step.gif}
                                    src={step.gif}
                                    alt="Mana Mascot Animation"
                                    className={style.mascotGif}
                                />
                            </div>
                            <span className={style.mascotNameTag}>Mana AI</span>
                        </div>

                        <div className={style.contentColumn}>
                            <div className={style.areaTag}>
                                🎯 {isVi ? 'Khu vực:' : 'Section:'} <strong>{step.areaName}</strong>
                            </div>
                            <h3 className={style.stepTitle}>{step.title}</h3>
                            <p className={style.stepDesc}>{step.description}</p>
                        </div>
                    </div>

                    {/* Step-by-step How To Use Box */}
                    <div className={style.howToBox}>
                        <div className={style.howToHeader}>
                            <span>👆 {isVi ? 'Hướng dẫn thao tác chi tiết:' : 'How to use this section:'}</span>
                        </div>
                        <ul className={style.howToList}>
                            {step.howToUse.map((item, i) => (
                                <li
                                    key={i}
                                    className={style.howToItem}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tip Box */}
                    <div className={style.tipBox}>{step.tip}</div>

                    {/* Footer Navigation */}
                    <div className={style.cardFooter}>
                        <button
                            type="button"
                            className={style.skipBtn}
                            onClick={handleClose}
                        >
                            {isVi ? 'Tạm ẩn hướng dẫn' : 'Minimize tour'}
                        </button>

                        <div className={style.navButtons}>
                            <button
                                type="button"
                                className={style.secondaryBtn}
                                onClick={handlePrev}
                                disabled={safeStepIndex === 0}
                            >
                                ← {isVi ? 'Trước' : 'Back'}
                            </button>
                            <button
                                type="button"
                                className={style.primaryBtn}
                                onClick={handleNext}
                            >
                                {safeStepIndex === steps.length - 1 ? (
                                    <>{isVi ? 'Hoàn tất ✓' : 'Finish ✓'}</>
                                ) : (
                                    <>{isVi ? 'Phần tiếp theo →' : 'Next Section →'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
