import Image from 'next/image';

import './style.scss'

const ArticleLoading = () => {
    return (
        <div className="article-loading">
            <Image width={300} height={300} style={{
                objectFit: 'cover'
            }} src="https://media0.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" alt="Waiting Gif" />
            <h1>Loading...</h1>
        </div>
    )
}

export default ArticleLoading;