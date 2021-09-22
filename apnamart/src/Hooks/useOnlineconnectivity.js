import { getuserprofile, getproductsdata } from '../actions'
import { useEffect, useState } from 'react'

export const useOnlineconnectioncheck = (dispatch, isonline, Auth, Profile, products) => {
    const [isuseronline, changeuseronlinestatus] = useState(true)

    useEffect(() => {
        if (Auth !== " " && Object.keys(Profile).length === 0 && isonline === true) {
            dispatch(getuserprofile(Auth))
            return
        }
    }, [Auth, dispatch, Profile, isonline])

    useEffect(() => {
        if (Object.keys(products).length === 0 && isonline === true) {
            dispatch(getproductsdata())
        }
    }, [products, dispatch, isonline])

    useEffect(() => {
        if (Object.keys(products).length === 0 && isonline !== true ) {
            changeuseronlinestatus(false)
            return
        }
        if (isuseronline === false) {
            changeuseronlinestatus(true)
        }
    },[isonline, products, isuseronline, changeuseronlinestatus])

    return isuseronline
}