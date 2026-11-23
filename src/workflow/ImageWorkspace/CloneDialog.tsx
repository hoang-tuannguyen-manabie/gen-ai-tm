import { useRef, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@genaitm/components/button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { modelShared, sessionCode, shareModel, shareModelError, shareSamples } from '@genaitm/state';
import { Alert, CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from './TeachableMachine.module.css';
import { BusyButton } from '@genai-fi/base';

export interface SaveProperties {
    samples: boolean;
    model: boolean;
    behaviours: boolean;
}

interface Props {
    open: boolean;
    ready?: boolean;
    onClose: () => void;
}

export default function CloneDialog({ open, onClose, ready }: Props) {
    const code = useAtomValue(sessionCode);
    const [samples, setShareSamples] = useAtom(shareSamples);
    const { namespace } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const isVi = i18n.language?.startsWith('vi');
    const textRef = useRef<HTMLInputElement>(null);
    const [shared, setShared] = useAtom(shareModel);
    const sharedModel = useAtomValue(modelShared);
    const [shareError, setShareError] = useAtom(shareModelError);

    useEffect(() => {
        if (open) {
            setShareError(null);
            setTimeout(() => {
                if (textRef.current) {
                    textRef.current.focus();
                    textRef.current.select();
                }
            }, 200);
        }
    }, [open, setShareError]);

    const doCopyCode = useCallback(() => {
        navigator.clipboard.writeText(code);
    }, [code]);

    const doChangeSamples = useCallback(() => {
        setShareSamples((old) => !old);
    }, [setShareSamples]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
        >
            <DialogTitle>{t('model.actions.clone')}</DialogTitle>
            {ready && (
                <DialogContent>
                    <p>{t(`${namespace}:share.labels.codeInstructions`)}</p>
                    <div className={style.codeContainer}>
                        <p className={style.codeShare}>{code}</p>
                        <IconButton
                            disabled={!navigator?.clipboard?.writeText}
                            onClick={doCopyCode}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </div>
                    <div className={style.incImagesContainer}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={samples}
                                    onChange={doChangeSamples}
                                />
                            }
                            label={t('share.labels.includeSamples')}
                        />
                    </div>
                    {shared && sharedModel && (
                        <Alert
                            severity="success"
                            sx={{ marginTop: '0.75rem' }}
                        >
                            {isVi
                                ? 'Đã chia sẻ thành công! Người khác có thể bấm "Mở" và nhập mã trên để tải bản sao.'
                                : 'Shared successfully! Others can click "Open" and enter the code above.'}
                        </Alert>
                    )}
                    {shareError && (
                        <Alert
                            severity="error"
                            sx={{ marginTop: '0.75rem' }}
                        >
                            {isVi
                                ? 'Không thể chia sẻ bản sao lúc này. Vui lòng thử lại.'
                                : 'Could not share copy right now. Please try again.'}
                        </Alert>
                    )}
                </DialogContent>
            )}
            {!ready && (
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            )}
            <DialogActions>
                <BusyButton
                    busy={!ready || (shared && !sharedModel)}
                    variant="contained"
                    onClick={() => {
                        setShareError(null);
                        setShared((old) => !old);
                    }}
                    data-testid="share-share"
                >
                    {sharedModel && shared ? t('share.actions.stopShare') : t('share.actions.share')}
                </BusyButton>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    data-testid="share-close"
                >
                    {t('share.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
