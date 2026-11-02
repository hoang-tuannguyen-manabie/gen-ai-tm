import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import style from './MascotGuide.module.css';

interface GuideStep {
    title: { vi: string; en: string };
    description: { vi: string; en: string };
    tip?: { vi: string; en: string };
    image: string;
}

const STEPS: GuideStep[] = [
    {
        title: {
            vi: 'Chào mừng bạn đến với Teachable Machine!',
            en: 'Welcome to Teachable Machine!',
        },
        description: {
            vi: 'Mình là trợ lý AI Manabie! Mình sẽ đồng hành hướng dẫn bạn cách tạo một mô hình Trí Tuệ Nhân Tạo (AI) nhận diện hình ảnh của riêng bạn chỉ trong vài phút, không cần viết code!',
            en: 'I am your Manabie AI Assistant! I will guide you to train your very own AI image classifier in just a few minutes, with zero coding required!',
        },
        tip: {
            vi: 'Mọi tính toán AI đều chạy trực tiếp trên trình duyệt máy bạn, hoàn toàn riêng tư và bảo mật!',
            en: 'All AI processing happens right in your browser, 100% private and secure!',
        },
        image: '/mascot/mascot-wave.png',
    },
    {
        title: {
            vi: 'Bước 1: Thu thập mẫu ảnh cho các lớp',
            en: 'Step 1: Collect training samples',
        },
        description: {
            vi: 'Để AI phân biệt được các đồ vật (như Bút, Sách, Chó, Mèo), bạn nạp ảnh vào từng Lớp (Class). Nhấn "Webcam" và giữ nút chụp, hoặc "Tải lên" ảnh từ máy tính / chọn "Bộ dữ liệu" có sẵn.',
            en: 'To teach the AI to recognize objects (like Pen, Book, Dog, Cat), add sample photos to each Class. Click "Webcam" and hold to capture, or "Upload" images from your device.',
        },
        tip: {
            vi: 'Nên chụp từ 15-25 bức ảnh ở nhiều góc độ và ánh sáng khác nhau để AI nhận diện tốt nhất!',
            en: 'Tip: Add 15-25 images with different angles and lighting for best accuracy!',
        },
        image: '/mascot/mascot-point.png',
    },
    {
        title: {
            vi: 'Bước 2: Huấn luyện mô hình AI',
            en: 'Step 2: Train the classifier',
        },
        description: {
            vi: 'Khi đã chuẩn bị ảnh cho ít nhất 2 lớp, bạn nhấp vào nút "Huấn luyện bộ phân loại". Mô hình MobileNet sẽ học cực nhanh bằng công nghệ Transfer Learning ngay trong máy của bạn.',
            en: 'Once you have samples in at least 2 classes, click "Train classifier". The deep learning model will learn your classes in seconds using Transfer Learning.',
        },
        tip: {
            vi: 'Quá trình huấn luyện chỉ mất khoảng vài giây tùy thuộc vào số lượng ảnh mẫu của bạn.',
            en: 'Training takes just a few seconds depending on how many images you have.',
        },
        image: '/mascot/mascot-action.png',
    },
    {
        title: {
            vi: 'Bước 3: Kiểm thử kết quả trực tiếp',
            en: 'Step 3: Test and preview predictions',
        },
        description: {
            vi: 'Bật webcam hoặc tải ảnh mới vào khung "Đầu vào" để xem AI dự đoán theo thời gian thực! Thanh độ tự tin (%) sẽ cho bạn biết AI chắc chắn về phán đoán của mình đến mức nào.',
            en: 'Turn on the camera in "Input" to test your model live! The probability bars show how confident the AI is about its prediction.',
        },
        tip: {
            vi: 'Bật "Bên trong mô hình" để xem Bản đồ nhiệt (Heatmap) thể hiện AI đang tập trung nhìn vào vùng ảnh nào!',
            en: 'Tip: Open "Under The Hood" to see the Heatmap showing which features the AI looks at!',
        },
        image: '/mascot/mascot-point.png',
    },
    {
        title: {
            vi: 'Bước 4: Thêm hành vi & Lưu dự án',
            en: 'Step 4: Add behaviours and save',
        },
        description: {
            vi: 'Bạn có thể gán cho mỗi kết quả nhận diện một âm thanh, ảnh vui nhộn hoặc gửi tín hiệu ra thiết bị USB (như Micro:bit/Arduino). Khi hoàn thành, nhấn nút "Lưu" trên thanh công cụ để tải file dự án .zip về máy!',
            en: 'Attach custom sounds, images, or USB signals (Micro:bit/Arduino) to each class. When finished, click "Save" on the top bar to download your project file!',
        },
        tip: {
            vi: 'Bạn có thể mở lại file .zip này bất cứ lúc nào qua nút "Mở".',
            en: 'You can reload your saved project .zip file anytime via the "Open" button.',
        },
        image: '/mascot/mascot-wave.png',
    },
];

const ONBOARDING_KEY = 'tm_manabie_mascot_onboarding_seen';

export default function MascotGuide() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');

    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Auto-open on first visit
    useEffect(() => {
        const seen = localStorage.getItem(ONBOARDING_KEY);
        if (!seen) {
            const timer = setTimeout(() => {
                setOpen(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpen = useCallback(() => {
        setCurrentStep(0);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        localStorage.setItem(ONBOARDING_KEY, 'true');
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleClose();
        }
    }, [currentStep, handleClose]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const stepData = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <div
            className={style.mascotGuideContainer}
            data-testid="mascot-guide"
        >
            <div className={style.interactiveArea}>
                {open ? (
                    <div
                        className={style.guideCard}
                        role="dialog"
                        aria-label="AI Mascot Guide"
                    >
                        <div className={style.cardHeader}>
                            <div className={style.headerTitleGroup}>
                                <AutoAwesomeIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                                <span className={style.stepBadge}>
                                    {isVi ? `Bước ${currentStep + 1} / ${STEPS.length}` : `Step ${currentStep + 1} / ${STEPS.length}`}
                                </span>
                            </div>
                            <button
                                className={style.closeButton}
                                onClick={handleClose}
                                title={isVi ? 'Đóng hướng dẫn' : 'Close guide'}
                                aria-label="Close"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <div className={style.cardBody}>
                            <div className={style.mascotPreview}>
                                <img
                                    key={stepData.image}
                                    src={stepData.image}
                                    alt="Manabie AI Mascot"
                                />
                            </div>
                            <div className={style.messageContent}>
                                <h3 className={style.stepTitle}>
                                    {isVi ? stepData.title.vi : stepData.title.en}
                                </h3>
                                <p className={style.stepDescription}>
                                    {isVi ? stepData.description.vi : stepData.description.en}
                                </p>
                                {stepData.tip && (
                                    <div className={style.stepTip}>
                                        💡 {isVi ? stepData.tip.vi : stepData.tip.en}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={style.cardFooter}>
                            <div className={style.progressDots}>
                                {STEPS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`${style.dot} ${idx === currentStep ? style.activeDot : ''}`}
                                    />
                                ))}
                            </div>
                            <div className={style.buttonGroup}>
                                {currentStep > 0 ? (
                                    <button
                                        className={style.btnSecondary}
                                        onClick={handlePrev}
                                    >
                                        {isVi ? 'Quay lại' : 'Back'}
                                    </button>
                                ) : (
                                    <button
                                        className={style.btnSecondary}
                                        onClick={handleClose}
                                    >
                                        {isVi ? 'Bỏ qua' : 'Skip'}
                                    </button>
                                )}
                                <button
                                    className={style.btnPrimary}
                                    onClick={handleNext}
                                >
                                    {isLastStep
                                        ? isVi
                                            ? 'Bắt đầu ngay!'
                                            : "Let's Go!"
                                        : isVi
                                          ? 'Tiếp tục'
                                          : 'Next'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Floating Mascot Button */}
                <button
                    className={style.floatingAvatarButton}
                    onClick={open ? handleClose : handleOpen}
                    title={isVi ? 'Trợ lý AI hướng dẫn' : 'AI Mascot Guide'}
                    aria-label="AI Guide"
                >
                    <img
                        className={style.avatarImage}
                        src="/mascot/mascot-wave.png"
                        alt="Manabie AI Mascot"
                    />
                    <span className={style.avatarLabel}>
                        {isVi ? 'Trợ lý AI' : 'AI Guide'}
                    </span>
                </button>
            </div>
        </div>
    );
}
