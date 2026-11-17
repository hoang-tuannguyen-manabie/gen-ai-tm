import { Link } from 'react-router';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { ReactNode, useMemo } from 'react';
import { compressToEncodedURIComponent } from 'lz-string';
import { IVariantContext } from '@genaitm/util/variant';
import { VARIANTS } from '../General/General';
import { DEFAULTS } from '../SettingsDialog/SettingsForm';
import { TMType } from '@genaitm/util/TeachableModel';

function delta(data: IVariantContext, template: VARIANTS): Partial<IVariantContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    const keys = Object.keys(data) as (keyof IVariantContext)[];
    const merged = {
        ...DEFAULTS.base,
        ...DEFAULTS[data.modelVariant],
        ...DEFAULTS[template],
    };
    for (const k of keys) {
        if (data[k] !== merged[k]) {
            result[k] = data[k];
        }
    }
    return result;
}

interface Props {
    id: string;
    usb?: boolean;
    junior?: boolean;
    image?: string;
    icon?: ReactNode;
}

export default function Model({ id, usb, junior, image, icon }: Props) {
    const { t } = useTranslation('image_adv');

    const url = useMemo(() => {
        const targetVariant: VARIANTS = junior ? 'junior' : 'general';
        const state: IVariantContext = {
            modelVariant: id as TMType,
            namespace: 'image_adv',
            allowSerialUSB: usb ? true : undefined,
        };
        const str = JSON.stringify(delta(state, targetVariant));
        const urlCode = compressToEncodedURIComponent(str);
        return str === '{}' ? `/${id}/${targetVariant}` : `/${id}/${targetVariant}?c=${urlCode}`;
    }, [id, usb, junior]);

    const modelLabel = t(`app.models.${id}`);

    return (
        <Link
            to={url}
            className={style.step}
        >
            {image && (
                <img
                    src={image}
                    width={128}
                    height={128}
                    alt={modelLabel}
                    className={style.stepImage}
                />
            )}
            {icon && <div className={style.icon}>{icon}</div>}
            <div className={style.stepContent}>
                <h2>{modelLabel}</h2>
            </div>
        </Link>
    );
}
