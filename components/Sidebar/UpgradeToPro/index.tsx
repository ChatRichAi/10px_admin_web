import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { useState } from "react";

type UpgradeToProProps = {};

const UpgradeToPro = ({ }: UpgradeToProProps) => {
    const [visible, setVisible] = useState<boolean>(true);

    return visible ? (
        <div className="shrink-0 rounded-2xl overflow-hidden mt-4 bg-theme-on-surface-2 md:hidden">
            <div className="relative">
                <Image
                    className="w-full h-32 object-cover opacity-100"
                    src="/images/bg-upgrade.jpg"
                    width={292}
                    height={128}
                    alt=""
                />
                <button
                    className="group absolute right-2 top-2 w-6 h-6 rounded-full bg-theme-on-surface-1 text-0 transition-colors hover:bg-theme-primary"
                    onClick={() => setVisible(false)}
                >
                    <Icon
                        className="!w-4 !h-4 fill-theme-primary transition-colors group-hover:fill-theme-on-surface-1"
                        name="close"
                    />
                </button>
            </div>
            <div className="p-6">
                <div className="mb-2 text-h5 2xl:text-title-1s">
                    自然语言挖掘量化机会
                </div>
                <div className="-mr-1 text-body-2s text-theme-secondary">
                    使用人工智能算法，根据用户定义的标准实现交易自动化
                </div>
                <Link className="btn-secondary w-full mt-6" href="/pricing">
                    立即升级
                </Link>
            </div>
        </div>
    ) : null;
};

export default UpgradeToPro;
