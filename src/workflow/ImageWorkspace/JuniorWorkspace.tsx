import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrainingData } from '../TrainingData/TrainingData';
import Trainer from '../Trainer/Trainer';
import Input from '../Input/Input';
import Preview from '../Preview/Preview';
import { IClassification } from '../../state';
import { useVariant } from '../../util/variant';
import { useHasModel } from '../../util/TeachableModel';
import { WorkflowLayout } from '@genai-fi/base';
import style from './JuniorWorkspace.module.css';

interface JuniorWorkspaceProps {
    data: IClassification[];
    doSetData: (d: ((old: IClassification[]) => IClassification[]) | IClassification[]) => void;
    editingData: boolean;
    setEditingData: (f: boolean) => void;
    doLabelEdited: (index: number) => void;
    doTrained: () => void;
    doShare: () => void;
    doClone: () => void;
}

export default function JuniorWorkspace({
    data,
    doSetData,
    editingData,
    setEditingData,
    doLabelEdited,
    doTrained,
    doShare,
    doClone,
}: JuniorWorkspaceProps) {
    const { i18n } = useTranslation();
    const { modelVariant } = useVariant();
    const isVi = i18n.language?.startsWith('vi');
    const hasModel = useHasModel();

    // 0 = Bước 1 (Thu thập ví dụ & Gắn nhãn)
    // 1 = Bước 2 (Cho máy học)
    // 2 = Bước 3 (Kiểm tra, đánh giá + Note Bước 4: Điều chỉnh)
    const [activePage, setActivePage] = useState<number>(0);

    const enabledData = useMemo(() => data.filter((d) => !d.disabled), [data]);
    const sampleMin = useMemo(
        () => (enabledData.length > 0 ? Math.min(...enabledData.map((v) => v.samples.length)) : 0),
        [enabledData]
    );
    const backgroundNoiseNum = modelVariant === 'speech' ? (enabledData[0]?.samples.length ?? 0) : Infinity;
    const isTrainable = enabledData.length >= 2 && sampleMin >= 2 && backgroundNoiseNum >= 20;

    const steps = useMemo(
        () => [
            {
                index: 0,
                title: isVi ? 'Thu thập ví dụ & Gắn nhãn' : 'Collect & Label',
            },
            {
                index: 1,
                title: isVi ? 'Cho máy học' : 'Train Model',
            },
            {
                index: 2,
                title: isVi ? 'Kiểm tra, đánh giá' : 'Test & Evaluate',
            },
        ],
        [isVi]
    );

    const bannerInfo = useMemo(() => {
        if (activePage === 0) {
            return {
                gif: '/mascot/mana_dong_chi.gif',
                title: isVi ? 'Bước 1: Thu thập ví dụ & Gắn nhãn' : 'Step 1: Collect Examples & Label',
                desc: isVi
                    ? 'Đặt tên nhãn và thêm ít nhất 2 ví dụ (Webcam hoặc Tải lên) cho mỗi nhóm.'
                    : 'Name each group and add at least 2 examples (Webcam or Upload) per group.',
            };
        }
        if (activePage === 1) {
            if (hasModel) {
                return {
                    gif: '/mascot/mana_dong_vo_tay.gif',
                    title: isVi ? 'Máy đã học xong rồi! 🎉' : 'The computer finished learning! 🎉',
                    desc: isVi
                        ? 'Bấm "Sang Bước 3: Kiểm tra, đánh giá" để thử tài của máy nhé!'
                        : 'Click "Go to Step 3: Test & Evaluate" to test your model!',
                };
            }
            return {
                gif: '/mascot/mana_dong_noi.gif',
                title: isVi ? 'Bước 2: Cho máy học' : 'Step 2: Train the Computer',
                desc: isVi
                    ? 'Bấm nút "Huấn luyện" để máy học từ các ví dụ em vừa thu thập.'
                    : 'Click "Train" so the computer learns from your collected examples.',
            };
        }
        return {
            gif: '/mascot/mana_dong_kiem_tra.gif',
            title: isVi ? 'Bước 3: Kiểm tra, đánh giá' : 'Step 3: Test & Evaluate',
            desc: isVi
                ? 'Đưa hình ảnh/âm thanh vào bên trái và xem kết quả máy đoán ở bên phải.'
                : 'Provide input on the left and check the prediction results on the right.',
        };
    }, [activePage, hasModel, isVi]);

    return (
        <div className={style.juniorViewport}>
            <WorkflowLayout connections={[]}>
                <div className={style.juniorContainer}>
                    {/* Unified Top Bar: Stepper Tabs + Mascot Mana Guidance */}
                    <header className={style.topHeaderBar}>
                        <div className={style.manaGuideCompact}>
                            <div className={style.manaAvatarBox}>
                                <img
                                    key={bannerInfo.gif}
                                    src={bannerInfo.gif}
                                    alt="Mana Mascot"
                                    className={style.manaBannerGif}
                                />
                            </div>
                            <div className={style.manaBannerText}>
                                <h2 className={style.manaTitle}>{bannerInfo.title}</h2>
                                <p className={style.manaDesc}>{bannerInfo.desc}</p>
                            </div>
                        </div>

                        <nav
                            className={style.stepperBar}
                            aria-label={isVi ? 'Các bước thực hiện' : 'Workflow steps'}
                        >
                            {steps.map((s) => {
                                const isActive = activePage === s.index;
                                const isCompleted =
                                    (s.index === 0 && isTrainable) || (s.index === 1 && hasModel);
                                return (
                                    <button
                                        key={s.index}
                                        type="button"
                                        className={`${style.stepTab} ${isActive ? style.stepTabActive : ''} ${
                                            isCompleted ? style.stepTabCompleted : ''
                                        }`}
                                        onClick={() => setActivePage(s.index)}
                                    >
                                        <span className={style.stepNumber}>{s.index + 1}</span>
                                        <span className={style.stepMainTitle}>{s.title}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </header>

                    {/* Main Viewport Stage (No page scrolling) */}
                    <section className={style.pageStage}>
                        {/* PAGE 1: Thu thập ví dụ & Gắn nhãn */}
                        <div
                            className={style.pageOneWrapper}
                            style={{ display: activePage === 0 ? 'flex' : 'none' }}
                        >
                            <div className={style.trainingDataSpread}>
                                <TrainingData
                                    data={data}
                                    setData={doSetData}
                                    active={activePage === 0}
                                    onFocused={setEditingData}
                                    onLabelEdited={doLabelEdited}
                                />
                            </div>

                            <footer className={style.pageFooterBar}>
                                <div className={style.readinessHint}>
                                    {isTrainable ? (
                                        <span className={style.readyBadge}>
                                            ✅ {isVi ? 'Đã đủ ví dụ! Sẵn sàng sang Bước 2.' : 'Ready for Step 2!'}
                                        </span>
                                    ) : (
                                        <span className={style.pendingBadge}>
                                            💡{' '}
                                            {isVi
                                                ? 'Cần ít nhất 2 nhóm nhãn, mỗi nhóm từ 2 ví dụ trở lên.'
                                                : 'Add at least 2 examples in 2 groups.'}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={style.nextPageBtn}
                                    onClick={() => setActivePage(1)}
                                >
                                    {isVi ? 'Bước 2: Cho máy học →' : 'Step 2: Train →'}
                                </button>
                            </footer>
                        </div>

                        {/* PAGE 2: Cho máy học */}
                        <div
                            className={style.pageTwoWrapper}
                            style={{ display: activePage === 1 ? 'flex' : 'none' }}
                        >
                            <div className={style.pageTwoCenter}>
                                <div className={style.sampleSummaryCard}>
                                    <div className={style.summaryTitle}>
                                        📦 {isVi ? 'Ví dụ đã thu thập:' : 'Collected examples:'}
                                    </div>
                                    <div className={style.summaryChips}>
                                        {data.map((cls, idx) => (
                                            <div
                                                key={idx}
                                                className={style.summaryChip}
                                            >
                                                <strong>{cls.label}</strong>
                                                <span>
                                                    {cls.samples.length} {isVi ? 'mẫu' : 'samples'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={style.trainerCenterBox}>
                                    <Trainer
                                        focus={activePage === 1}
                                        editing={editingData}
                                        onTrained={doTrained}
                                    />
                                </div>
                            </div>

                            <footer className={style.pageFooterBar}>
                                <button
                                    type="button"
                                    className={style.backPageBtn}
                                    onClick={() => setActivePage(0)}
                                >
                                    ← {isVi ? 'Bước 1: Thu thập ví dụ' : 'Step 1: Collect'}
                                </button>

                                <button
                                    type="button"
                                    className={style.nextPageBtn}
                                    onClick={() => setActivePage(2)}
                                >
                                    {isVi ? 'Bước 3: Kiểm tra, đánh giá →' : 'Step 3: Test & Evaluate →'}
                                </button>
                            </footer>
                        </div>

                        {/* PAGE 3: Kiểm tra, đánh giá + Note Bước 4: Điều chỉnh */}
                        {activePage === 2 && (
                            <div className={style.pageThreeWrapper}>
                                <div className={style.testGrid}>
                                    <div className={style.testCard}>
                                        <Input />
                                    </div>
                                    <div className={style.testCard}>
                                        <Preview
                                            onExport={doShare}
                                            onClone={doClone}
                                        />
                                    </div>
                                </div>

                                {/* Compact Bottom Bar combining Back Button + Note Bước 4: Điều chỉnh */}
                                <footer className={style.stepFourBar}>
                                    <button
                                        type="button"
                                        className={style.backPageBtn}
                                        onClick={() => setActivePage(1)}
                                    >
                                        ← {isVi ? 'Bước 2' : 'Step 2'}
                                    </button>

                                    <div className={style.stepFourNoteInline}>
                                        <img
                                            src="/mascot/mana_dong_boi_roi.gif"
                                            alt="Mana"
                                            className={style.stepFourGif}
                                        />
                                        <div className={style.stepFourText}>
                                            <strong>
                                                🔄 {isVi ? 'Bước 4 — Điều chỉnh:' : 'Step 4 — Adjust:'}
                                            </strong>{' '}
                                            {isVi
                                                ? 'AI cũng có thể sai! Nếu máy đoán chưa đúng, em hãy quay lại Bước 1 nạp thêm ví dụ nhé.'
                                                : 'AI can make mistakes! If it guesses wrong, go back to Step 1 to add more examples.'}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={style.adjustReturnBtn}
                                        onClick={() => setActivePage(0)}
                                    >
                                        ➕ {isVi ? 'Quay lại Bước 1 thêm ví dụ' : 'Back to Step 1'}
                                    </button>
                                </footer>
                            </div>
                        )}
                    </section>
                </div>
            </WorkflowLayout>
        </div>
    );
}
