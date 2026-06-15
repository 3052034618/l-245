export default defineAppConfig({
  pages: [
    'pages/checkin/index',
    'pages/calendar/index',
    'pages/mall/index',
    'pages/ranking/index',
    'pages/profile/index',
    'pages/makeup/index',
    'pages/gift-detail/index',
    'pages/carpool-detail/index',
    'pages/route-setting/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00B42A',
    navigationBarTitleText: '低碳通勤',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00B42A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/checkin/index',
        text: '今日打卡'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '通勤日历'
      },
      {
        pagePath: 'pages/mall/index',
        text: '积分商城'
      },
      {
        pagePath: 'pages/ranking/index',
        text: '团队榜单'
      },
      {
        pagePath: 'pages/profile/index',
        text: '个人中心'
      }
    ]
  }
})
