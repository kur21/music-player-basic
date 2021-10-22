/**
    * 1. Render songs
    * 2. Scroll top
    * 3. Play/Pause/Seek
    * 4. CD rotate
    * 5. Next/Previous
    * 6. Random/Shuffle
    * 7. Next/Repeat when ended
    * 8. Active song
    * 9. Scroll active song into view
    * 10. Play song when click
    * 11. Time for song
    * 12. Volume for song
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'HISU_PLAYER'
const body = $('body')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const downloadBtn = $('.download')

const volume = $('.volume')
const volumeCover = $('.volume-cover')
const volumeProgress = $('.volume-progress')
const volumeIcon = $('.volume-icon')
const muteVolumeBtn = $('.volume-mute-icon')
const lowVolumeBtn = $('.volume-low-icon')
const highVolumeBtn = $('.volume-high-icon')

const audioCurrentTime = $('.audio-current-time')
const audioDurationTime = $('.audio-duration-time')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {isRepeat: false, isRandom: false,currentIndex: 0, currentTime: 0, duration: 0},
    songPlayedRandom: [],
    setConfig: function(key,value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: "Hoàng Kim Giáp",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/HoangKimGiap-JayChou.mp3",
            image: "./assets/musics/HoangKimGiap-JayChou.jpg"
        },
        {
            name: "Find Day",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/FindDay-JayChou.mp3",
            image: "./assets/musics/FindDay-JayChou.jpg"
        },
        {
            name: "Hoắc Nguyên Giáp",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/HoacNguyenGiap-JayChou.mp3",
            image: "./assets/musics/HoacNguyenGiap-JayChou.jpg"
        },
        {
            name: "Dạ Khúc",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/DaKhuc-JayChou.mp3",
            image: "./assets/musics/DaKhuc-JayChou.jpg"
        },
        {
            name: "Hứa Sẽ Không Khóc",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/HuaSeKhongKhoc-JayChou.mp3",
            image: "./assets/musics/HuaSeKhongKhoc-JayChou.jpg"
        },
        {
            name: "Hương Lúa",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/HuongLua-JayChou.mp3",
            image: "./assets/musics/HuongLua-JayChou.jpg"
        },
        {
            name: "Không Yêu Thì Thôi",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/KhongYeuToiThiThoi-JayChou.mp3",
            image: "./assets/musics/KhongYeuToiThiThoi-JayChou.jpg"
        },
        {
            name: "Sứ Thanh Hoa",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/SuThanhHoa-JayChou.mp3",
            image: "./assets/musics/SuThanhHoa-JayChou.jpg"
        },
        {
            name: "Thất Lý Hương",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/ThatLyHuong-JayChou.mp3",
            image: "./assets/musics/ThatLyHuong-JayChou.jpg"
        },
        {
            name: "Tôi Tin Là Như Vậy",
            singer: "Châu Kiệt Luân",
            path: "./assets/musics/ToiTinLaNhuVay-JayChou.mp3",
            image: "./assets/musics/ToiTinLaNhuVay-JayChou.jpg"
        }
    ],
    // Function render music
    render: function () {
        const htmls = this.songs.map((song,index) => {
            return `
                <div class="song" data-id="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    // Function define properties
    defineProperties: function() {
        // Create property 'currentSong' for object 'app'
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    // Function handle Events
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth
        // Xử lý CD xoay
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'},
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        // Xử lý phóng to/ thu nhỏ thumb CD và rotate volumeBar
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = (newCdWidth > 0) ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth/cdWidth

            if (newCdWidth < 70) {
                volumeProgress.style.width = '50px'
                volumeCover.style.height = '100px'
            } else {
                volumeProgress.style.width = '100px'
                volumeCover.style.height = '150px'
            }
        }
        // Xử lý khi click play button
        playBtn.onclick = function () {
            // _this.isPlaying ? audio.pause() : audio.play()
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.currentTime = _this.config.currentTime
                audio.play()
            }
        }
        // When song play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            document.title = `${_this.currentSong.name} - ${_this.currentSong.singer}`
        }
        // When song pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
            document.title = "MUSIC PLAYER"
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = (audio.currentTime/audio.duration*100)
                progress.value = progressPercent
                progress.style.background = `linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color) ${progress.value-0.2}%, #d3d3d3 ${progress.value-1}%, #d3d3d3 100%)`

                audioCurrentTime.innerText = _this.convertTime(audio.currentTime)
                audioDurationTime.innerText = _this.convertTime(audio.duration)

                _this.setConfig('currentTime', audio.currentTime)
                _this.setConfig('duration', audio.duration)
            }
        }
        // Xử lý khi tua bài hát
        progress.oninput = function (e) {
            const seekTime = e.target.value*audio.duration/100
            audio.currentTime = seekTime
        }
        // Xử lý khi bấm next
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }
        // Xử lý khi bấm prev
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }
        // Xử lý khi bật tắt random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // Xử lý khi bật tắt repeat
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
            audio.loop = _this.isRepeat
        }
        // Xử lý next song when audio ended
        audio.onended = function () {
            nextBtn.click()
        }
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            // Xử lý khi click song
            const songNode = e.target.closest('.song')
            if (e.target.closest('.song:not(.active)')) {
                // _this.currentIndex = Number(songNode.getAttribute('data-id'))
                _this.currentIndex = Number(songNode.dataset.id)
                _this.removeClassActiveSong()
                _this.loadCurrentSong()
                audio.play()
            }
            // Xử lý khi click option
            if (e.target.closest('.option')) {
                // Code click option
            }
        }
        // Xử lý khi tăng giảm âm lượng
        volume.onmouseover = function () {
            body.style.overflow = 'hidden';
        };
        volume.onmouseout = function () {
            body.style.overflow = 'unset';
        };
        volumeProgress.oninput = function () {
            audio.volume = volumeProgress.value/100
            volumeProgress.style.background = `linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color) ${volumeProgress.value-0.2}%, #d3d3d3 ${volumeProgress.value-1}%, #d3d3d3 100%)`
            
            if (audio.volume > 0.5) {
                $('.volume-icon.active').classList.remove('active')
                highVolumeBtn.classList.add('active')
            } else if (audio.volume > 0 && audio.volume <= 0.5) {
                $('.volume-icon.active').classList.remove('active')
                lowVolumeBtn.classList.add('active')
            } else {
                $('.volume-icon.active').classList.remove('active')
                muteVolumeBtn.classList.add('active')
            }
        }        
    },
    convertTime: function(time) {
        var minutes = Math.floor(time/60)
        var seconds = Math.floor(time%60)
        
        var minutesString
        (minutes < 10) ? minutesString = `0${minutes}` : minutesString = `${minutes}`
        var secondsString
        (seconds < 10) ? secondsString = `0${seconds}` : secondsString = `${seconds}`
        
        return `${minutesString}:${secondsString}`
    }
    ,
    loadConfig: function () {
        // Nếu config set {isRepeat: false,isRandom: false,currentIndex: 0}
        this.isRandom = this.config.isRandom
        randomBtn.classList.toggle('active', this.isRandom)

        this.isRepeat = this.config.isRepeat
        repeatBtn.classList.toggle('active', this.isRepeat)

        this.currentIndex = this.config.currentIndex
    },
    scrollToActiveSong: function () {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        })
    },
    removeClassActiveSong: function () {
        $('.song.active').classList.remove('active')
    },
    loadCurrentSong: function() {
        const songActive = $(`.song[data-id='${this.currentIndex}']`)
        songActive.classList.add('active')

        heading.innerText = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        downloadBtn.href = this.currentSong.path

        this.setConfig('currentIndex', this.currentIndex)

        // Load thanh progress đã lưu trong config
        if(this.config.duration !== 0) {
            const progressCurrentPercent = (this.config.currentTime/this.config.duration*100)
            progress.style.background = `linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color) ${progressCurrentPercent-0.2}%, #d3d3d3 ${progressCurrentPercent-1}%, #d3d3d3 100%)`
            progress.value = progressCurrentPercent
        } else {
            progress.value = 0
        }
        // Load time đã lưu trong config
        audioCurrentTime.innerText = this.convertTime(this.config.currentTime)
        audioDurationTime.innerText = this.convertTime(this.config.duration)

    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.removeClassActiveSong()
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.removeClassActiveSong()
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        if (this.songPlayedRandom.length === this.songs.length) {
            this.songPlayedRandom = []
        }
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex || this.songPlayedRandom.includes(newIndex))
        this.currentIndex = newIndex
        this.removeClassActiveSong()
        this.loadCurrentSong()
        // Thêm id bài đã phát vào danh sách đã phát để ko lặp lại
        this.songPlayedRandom.push(this.currentIndex)
    },
    // Function start
    start: function() {
        this.loadConfig() // Gán cấu hình từ config vào obj app
        this.defineProperties() // Định nghĩa các thuộc tính cho object
        this.handleEvents() // Xử lý lắng nghe các sự kiện (DOM event)
        this.render() // Render playlist
        this.loadCurrentSong() // Tải thông tin bài hát đầu tiên khi chạy app
    }
}
app.start()