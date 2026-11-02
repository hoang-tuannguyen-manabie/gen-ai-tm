import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import style from './MascotGuide.module.css';

export interface GuideStep {
    id: string;
    badge: string;
    title: string;
    areaName: string;
    description: string;
    gif: string;
    targetSelector: string | null;
    revealColumns?: boolean;
}

const HOME_STEPS_VI: GuideStep[] = [
    {
        id: 'home-welcome',
        badge: '1 / 3',
        title: 'Chào bạn! Mình là Mana 👋',
        areaName: 'Trang chủ Teachable Machine',
        description:
            'Cùng Mana tự tay huấn luyện AI nhận diện hình ảnh, tư thế, cử chỉ tay và âm thanh ngay trên trình duyệt nhé!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: '[data-tour="home-header"]',
    },
    {
        id: 'home-lang',
        badge: '2 / 3',
        title: 'Chọn Ngôn ngữ',
        areaName: 'Menu Ngôn ngữ',
        description: 'Bạn có thể chuyển đổi giao diện sang Tiếng Việt hoặc ngôn ngữ khác tại góc phải trên cùng.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-tour="home-lang"]',
    },
    {
        id: 'home-models',
        badge: '3 / 3',
        title: 'Chọn Loại Mô hình AI 🚀',
        areaName: '4 Bộ phân loại AI',
        description:
            'Chọn Hình ảnh, Tư thế, Cử chỉ tay hoặc Âm thanh, sau đó nhấn "Tạo mới" để bắt đầu huấn luyện!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-tour="home-models"]',
    },
];

const HOME_STEPS_EN: GuideStep[] = [
    {
        id: 'home-welcome',
        badge: '1 / 3',
        title: 'Hi! I am Mana 👋',
        areaName: 'Teachable Machine Home',
        description:
            'Train your own AI to recognize images, poses, hand gestures, and sounds right in your browser!',
        gif: '/mascot/mana_dong_chao.gif',
        targetSelector: '[data-tour="home-header"]',
    },
    {
        id: 'home-lang',
        badge: '2 / 3',
        title: 'Select Language',
        areaName: 'Language Menu',
        description: 'Switch the interface language anytime from the top-right corner.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-tour="home-lang"]',
    },
    {
        id: 'home-models',
        badge: '3 / 3',
        title: 'Pick an AI Model 🚀',
        areaName: '4 AI Classifiers',
        description: 'Choose Image, Pose, Hand Gesture, or Speech, then click "Create" to start training!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-tour="home-models"]',
    },
];

const WORKSPACE_STEPS_VI: GuideStep[] = [
    {
        id: 'ws-training-data',
        badge: '1 / 7',
        title: '1. Thu thập Dữ liệu mẫu',
        areaName: 'Cột Dữ liệu (Classes)',
        description:
            'Đặt tên cho từng Lớp, sau đó mở Webcam hoặc Tải tệp lên để thu thập mẫu cho ít nhất 2 lớp.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '#class-0',
        revealColumns: false,
    },
    {
        id: 'ws-add-class',
        badge: '2 / 7',
        title: '2. Thêm Lớp mới',
        areaName: 'Nút + Thêm lớp',
        description: 'Nhấn "+ Thêm lớp" nếu bạn muốn dạy AI phân biệt nhiều nhóm đối tượng hơn.',
        gif: '/mascot/mana_dong_di.gif',
        targetSelector: '[data-testid="addClass"]',
        revealColumns: false,
    },
    {
        id: 'ws-trainer',
        badge: '3 / 7',
        title: '3. Huấn luyện AI',
        areaName: 'Khối Huấn luyện (Training)',
        description: 'Khi đã có mẫu ở các lớp, nhấn nút "Huấn luyện" để máy bắt đầu học cách phân loại.',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-widget="trainer"]',
        revealColumns: false,
    },
    {
        id: 'ws-input',
        badge: '4 / 7',
        title: '4. Đầu vào Kiểm thử',
        areaName: 'Khối Đầu vào (Input)',
        description: 'Bật Webcam, chọn Tệp hoặc quét QR từ điện thoại để đưa dữ liệu thử nghiệm vào mô hình.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-widget="input"]',
        revealColumns: false,
    },
    {
        id: 'ws-preview',
        badge: '5 / 7',
        title: '5. Kết quả & Giải thích AI',
        areaName: 'Xem trước & Công cụ XAI',
        description:
            'Xem tỷ lệ dự đoán theo thời gian thực, xuất mô hình hoặc mở Thống kê (Statistics) & Bản đồ nhiệt (Heatmap).',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-widget="model"]',
        revealColumns: false,
    },
    {
        id: 'ws-behaviours',
        badge: '6 / 7',
        title: '6. Gán Hành động phản hồi',
        areaName: 'Cột Hành động (Actions)',
        description: 'Chọn hiệu ứng tự động (hiện chữ, hình ảnh, phát âm thanh) khi AI nhận diện trúng từng lớp.',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: 'section[aria-labelledby="behaviours-title"]',
        revealColumns: true,
    },
    {
        id: 'ws-output',
        badge: '7 / 7',
        title: '7. Đầu ra & Lưu dự án 🎉',
        areaName: 'Cột Đầu ra (Output)',
        description:
            'Xem kết quả trình chiếu tại đây và nhấn nút "Lưu" trên thanh công cụ để tải dự án về máy nhé!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-widget="output"]',
        revealColumns: true,
    },
];

const WORKSPACE_STEPS_EN: GuideStep[] = [
    {
        id: 'ws-training-data',
        badge: '1 / 7',
        title: '1. Collect Training Samples',
        areaName: 'Class Card',
        description: 'Name each class and use your Webcam or Upload files to add examples for at least 2 classes.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '#class-0',
        revealColumns: false,
    },
    {
        id: 'ws-add-class',
        badge: '2 / 7',
        title: '2. Add More Classes',
        areaName: '+ Add a class',
        description: 'Click "+ Add a class" whenever you want your AI to recognize additional categories.',
        gif: '/mascot/mana_dong_di.gif',
        targetSelector: '[data-testid="addClass"]',
        revealColumns: false,
    },
    {
        id: 'ws-trainer',
        badge: '3 / 7',
        title: '3. Train Your Model',
        areaName: 'Training Block',
        description: 'Once your classes have samples, click "Train" so the AI learns to distinguish them.',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: '[data-widget="trainer"]',
        revealColumns: false,
    },
    {
        id: 'ws-input',
        badge: '4 / 7',
        title: '4. Test Input',
        areaName: 'Input Block',
        description: 'Use your Webcam, upload a file, or connect a mobile device to test your trained model live.',
        gif: '/mascot/mana_dong_chi.gif',
        targetSelector: '[data-widget="input"]',
        revealColumns: false,
    },
    {
        id: 'ws-preview',
        badge: '5 / 7',
        title: '5. Preview & Explainable AI',
        areaName: 'Preview & XAI',
        description: 'Check real-time confidence bars, export your model, or inspect Statistics and Heatmaps.',
        gif: '/mascot/mana_dong_kiem_tra.gif',
        targetSelector: '[data-widget="model"]',
        revealColumns: false,
    },
    {
        id: 'ws-behaviours',
        badge: '6 / 7',
        title: '6. Assign Actions',
        areaName: 'Actions Column',
        description: 'Trigger text, images, or sounds automatically whenever a class is detected.',
        gif: '/mascot/mana_dong_noi.gif',
        targetSelector: 'section[aria-labelledby="behaviours-title"]',
        revealColumns: true,
    },
    {
        id: 'ws-output',
        badge: '7 / 7',
        title: '7. Output & Save Project 🎉',
        areaName: 'Output Column',
        description: 'See your final interactive output here, and use "Save" in the top bar to download your project!',
        gif: '/mascot/mana_dong_vo_tay.gif',
        targetSelector: '[data-widget="output"]',
        revealColumns: true,
    },
];

const STORAGE_KEY_PREFIX = 'genai_tm_mana_tour_v3_';

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
                    // ignore scroll errors
                }
            }

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                setSpotlightRect(null);
                setCardPos({ placement: 'center' });
                return;
            }

            const pad = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

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

            const cardWidth = Math.min(340, vw - 24);
            const cardHeight = cardRef.current?.offsetHeight || 220;
            const gap = 18;
            const margin = 12;

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
            } else if (spaceBottom >= cardHeight) {
                placement = 'bottom';
                top = spotBottom + gap;
                left = spotLeft + spotWidth / 2 - cardWidth / 2;
            } else if (spaceTop >= cardHeight) {
                placement = 'top';
                top = spotTop - gap - cardHeight;
                left = spotLeft + spotWidth / 2 - cardWidth / 2;
            } else {
                placement = spotLeft > vw / 3 ? 'left' : 'right';
                left = placement === 'right' ? Math.max(margin, vw - cardWidth - margin) : margin;
                top = Math.max(margin, vh - cardHeight - margin);
            }

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

    useEffect(() => {
        if (!isOpen) return;

        const t0 = window.setTimeout(() => computeLayout(true), 40);
        const t1 = window.setTimeout(() => computeLayout(false), 280);
        const t2 = window.setTimeout(() => computeLayout(false), 550);

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
            // ignore
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
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

    if (!isOpen) {
        return (
            <div className={style.floatingContainer}>
                <button
                    type="button"
                    className={style.fabButton}
                    onClick={handleOpen}
                    title={isVi ? 'Bật Mana hướng dẫn' : 'Open Mana guide'}
                    aria-label={isVi ? 'Mở trợ lý AI hướng dẫn' : 'Open AI onboarding guide'}
                >
                    <img
                        src="/mascot/mana_dong_cho.gif"
                        alt="Mana AI Mascot"
                        className={style.fabMascotImg}
                    />
                    <span className={style.fabText}>{isVi ? 'Hướng dẫn (Mana)' : 'Guide (Mana)'}</span>
                </button>
            </div>
        );
    }

    const isCentered = cardPos.placement === 'center' || !spotlightRect;

    return (
        <div
            className={style.tourLayer}
            role="dialog"
            aria-label={isVi ? 'Trợ lý Mana hướng dẫn' : 'Mana Onboarding Guide'}
        >
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
                </div>
            ) : (
                <div className={style.fullBackdrop} />
            )}

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
                    <div className={style.cardHeader}>
                        <div className={style.stepDots}>
                            {steps.map((s, idx) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className={`${style.stepDot} ${idx === safeStepIndex ? style.stepDotActive : ''}`}
                                    onClick={() => setCurrentStep(idx)}
                                    title={s.title}
                                />
                            ))}
                            <span className={style.stepCounter}>{step.badge}</span>
                        </div>
                        <button
                            type="button"
                            className={style.iconBtn}
                            onClick={handleClose}
                            title={isVi ? 'Đóng' : 'Close'}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={style.cardBody}>
                        <div className={style.mascotStage}>
                            <img
                                key={step.gif}
                                src={step.gif}
                                alt="Mana Mascot"
                                className={style.mascotGif}
                            />
                        </div>

                        <div className={style.contentColumn}>
                            <h3 className={style.stepTitle}>{step.title}</h3>
                            <p className={style.stepDesc}>{step.description}</p>
                        </div>
                    </div>

                    <div className={style.cardFooter}>
                        <button
                            type="button"
                            className={style.skipBtn}
                            onClick={handleClose}
                        >
                            {isVi ? 'Bỏ qua' : 'Skip'}
                        </button>

                        <div className={style.navButtons}>
                            {safeStepIndex > 0 && (
                                <button
                                    type="button"
                                    className={style.secondaryBtn}
                                    onClick={handlePrev}
                                >
                                    ← {isVi ? 'Trước' : 'Back'}
                                </button>
                            )}
                            <button
                                type="button"
                                className={style.primaryBtn}
                                onClick={handleNext}
                            >
                                {safeStepIndex === steps.length - 1
                                    ? isVi
                                        ? 'Xong ✓'
                                        : 'Done ✓'
                                    : isVi
                                      ? 'Tiếp →'
                                      : 'Next →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
