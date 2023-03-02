import classNames from "classnames"
import { useNetwork } from "data/wallet"
import { useState, memo } from "react"
import { useTranslation } from "react-i18next"
import styles from "./ChainFilter.module.scss"
import { useSavedChain, useDisplayChains } from "utils/localStorage"
import { isTerraChain } from "utils/chain"

const ChainFilter = ({
  children,
  all,
  outside,
  title,
  className,
  terraOnly,
}: {
  children: (chain?: string) => React.ReactNode
  all?: boolean
  outside?: boolean
  title?: string
  className?: string
  terraOnly?: boolean
}) => {
  const { t } = useTranslation()
  const { savedChain, changeSavedChain } = useSavedChain()
  const network = useNetwork()
  const { displayChains } = useDisplayChains()

  const networks = Object.values(network)
    .sort((a, b) => (a.name === "Terra" ? -1 : b.name === "Terra" ? 1 : 0))
    .filter((n) => (terraOnly ? isTerraChain(n.prefix) : true))
    .filter((n) => displayChains.includes(n.chainID))

  const initNetwork =
    networks.find((n) => n.chainID === savedChain) ?? networks[0]

  const [selectedChain, setChain] = useState<string | undefined>(
    all ? undefined : initNetwork?.chainID
  )

  const handleSetChain = (chain: string | undefined) => {
    setChain(chain)
    if (terraOnly) return
    changeSavedChain(chain)
  }

  return (
    <div className={outside ? styles.chainfilter__out : styles.chainfilter}>
      <div
        className={classNames(
          className,
          styles.header,
          terraOnly ? styles.swap : ""
        )}
      >
        {title && <h1>{title}</h1>}
        <div className={styles.pills}>
          {all && (
            <button
              onClick={() => handleSetChain(undefined)}
              className={`${styles.all} ${selectedChain ?? styles.active}`}
            >
              {t("All")}
            </button>
          )}
          {networks.map((c) => (
            <button
              key={c.chainID}
              onClick={() => handleSetChain(c.chainID)}
              className={
                selectedChain === c.chainID ? styles.active : undefined
              }
            >
              <img src={c.icon} alt={c.name} />
              {c.name}
            </button>
          ))}
          {networks.length > displayChains.length && (
            <button className={styles.active}>
              {networks.length - displayChains.length}
            </button>
          )}
        </div>
      </div>
      <div className={styles.content}>{children(selectedChain)}</div>
    </div>
  )
}

export default memo(ChainFilter)
