import React from 'react'

function ColorDisplay(props) {
    const {value, size, reverse} = props
    const getColorAtValue = (value) => {
        /**
         * [0] for good scores
         * [1] for decent scores
         * [2] for bad scores
         * [3] for not available
         */
        const R = [237, 255,  34, 255]
        const G = [28,  201, 177, 255]
        const B = [36,  14,   76, 255]
        
        let resR, resG, resB
        if (isNaN(value)) {
            resR = R[3]
            resG = G[3]
            resB = B[3]
        } else if (value >= 90) {
            resR = R[2]
            resG = G[2]
            resB = B[2]
        } else if (value >= 50) {
            resR = R[1]
            resG = G[1]
            resB = B[1]
        } else {
            resR = R[0]
            resG = G[0]
            resB = B[0]
        }
        return `rgb(${resR}, ${resG}, ${resB})`
    }


    return (
        <div className={size ? `color-display ${size}` : 'color-display'} >
            <div className={value ? "point-color" : "hidden"} style={{ backgroundColor: getColorAtValue(reverse ? 100 - value : value) }}></div>
            <div className='right'>
                <div className='top' >{value || 'N/A'}</div>
            </div>
        </div>
    )
}

export default ColorDisplay