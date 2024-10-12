import { useState } from "react"

export const useDemoFilter = (onClose) => {
  const isDemoVersion = process.env.REACT_APP_DEMO_MODE === 'enabled'
  const [showModal, setShowModal] = useState(false)

  return {
    demoEnabled: isDemoVersion,
    state: showModal,
    setModalState: setShowModal,
    onClose
  }
}

export default useDemoFilter
 