import { useState, createRef, useEffect } from 'react';
import './App.scss';
import { LikeIcon, ReplyIcon, RetweetIcon, ShareIcon, VerifiedIcon } from './icons';
import { AvatarLoader } from './Loader';
import { language } from './Language';
import html2canvas from 'html2canvas'; // html2canvas kütüphanesini ekleyin

function App() {
  const tweetRef = createRef(null);
  const downloadRef = createRef(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isVerified, setIsVerified] = useState(0);
  const [tweet, setTweet] = useState('');
  const [avatar, setAvatar] = useState('');
  const [retweet, setRetweet] = useState(0);
  const [quoteTweet, setQuoteTweet] = useState(0);
  const [likes, setLikes] = useState(0);
  const [lang, setLang] = useState('tr');
  const [langText, setLangText] = useState();
  const [image, setImage] = useState(null); // Alınan görüntü durumu

  useEffect(() => {
    setLangText(language[lang]);
  }, [lang]);

  const tweetFormat = (tweet) => {
    /* format ayarları atılcak tweetin*/
    return tweet
      .replace(/@([\w]+)/g, '<span>@$1</span>')
      .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
      .replace(/(https?:\/\/[\w./]+)/, '<span>$1</span>')
      .replace(/\n/g, '<br />');
  };

  const formatNumber = (number) => {
    if (!number) {
      number = 0;
    }
    if (number < 1000) {
      return number;
    }
    number /= 1000;
    number = String(number).split('.');

    return (
      number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + ' B' : ' B')
    );
  };

  const getImage = async () => {
    if (tweetRef.current) {
      const canvas = await html2canvas(tweetRef.current); // Ekran görüntüsünü al
      const dataURL = canvas.toDataURL('image/png'); // PNG formatında veri URL'si oluştur
      setImage(dataURL); // Görüntüyü state'e kaydet
    }
  };

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(`https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`)
      .then(res => res.json())
      .then(data => {
        const twitter = data[0];
        console.log(twitter);

        setAvatar(twitter.profile_image_url_https); // Avatar'ı set et
        setName(twitter.name); // twitter.name'i set et
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweet(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  useEffect(() => {
    if (image) {
      // Görüntü alındığında indirme işlemi
      const link = document.createElement('a');
      link.href = image;
      link.download = 'tweet.png';
      link.click(); // İndir
    }
  }, [image]);

  return (
    <>
      {/* Tweet ayarlarının yapılcağı kısım */}
      <div className="tweet-settings">
        <h3>
          {langText?.settings}
        </h3>
        <ul>
          <li>
            <label>Ad Soyad</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </li>
          <li>
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              maxLength='290'
              value={tweet}
              onChange={e => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Avatar</label>
            <input
              type="file"
              className="input"
              onChange={avatarHandle}
            />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              className="input"
              value={retweet}
              onChange={e => setRetweet(e.target.value)}
            />
          </li>
          <li>
            <label>Alıntı Tweetler</label>
            <input
              type="number"
              className="input"
              value={quoteTweet}
              onChange={e => setQuoteTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Beğeni</label>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={e => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>Doğrulanmış Hesap</label>
            <select
              onChange={e => setIsVerified(e.target.value)}
              defaultValue={isVerified}
            >
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
            </select>
          </li>
          <button onClick={getImage}>Olustur</button>
        </ul>
      </div >
      <div className="tweet-container">
        <div className="app-language">
          <span onClick={() => setLang('tr')} className={lang === 'tr' && 'active'}>Türkçe</span>
          <span onClick={() => setLang('en')} className={lang === 'en' && 'active'}>English</span>
        </div>
        <div className="fetch-info">
          <input
            type="text"
            value={username}
            placeholder='Twitter kullanıcı adını yazın'
            onChange={e => setUsername(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>
        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {avatar ? <img src={avatar} alt="Avatar" /> : <AvatarLoader />}
            <div>
              <div className="name">{name || 'Ad Soyad'}
                {isVerified === 1 && <VerifiedIcon width='19' height='19' />}
              </div>
              <div className="username">@{username || 'kullaniciadi'}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html: (tweet && tweetFormat(tweet)) || 'Bu alana örnek tweet gelecek'
              }}
            />
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweet)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweet)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

//twitter fake tweet generator

export default App;
