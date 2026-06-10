import { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: '雲の一本橋：登竜門',
    description: '基本操作をじっくりマスターしよう！幅が広くゆったりとした一本橋。安全ポイントをチェックしながら、空中散歩のコツを掴んで。もっと長くなって新登場！',
    difficulty: 'Easy',
    startPos: { x: 0, y: 1.5, z: 45 },
    recommendedTime: 70,
    gravity: 0.95,
    platforms: [
      // 1. スタート地点 (Start Zone - Green)
      {
        id: 'l1_start',
        type: 'normal',
        position: { x: 0, y: 0, z: 45 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#4ade80', // green-400
        label: 'スタート地点',
      },
      // 2. 第一一本道 (First long straight bridge - Split with a nice introductory jump gap!)
      {
        id: 'l1_bridge1_a',
        type: 'normal',
        position: { x: 0, y: 0, z: 38.5 },
        size: { x: 2.0, y: 0.4, z: 8.0 },
        color: '#f59e0b', // amber-500
        label: 'スペースキーでジャンプ！',
      },
      {
        id: 'l1_bridge1_b',
        type: 'normal',
        position: { x: 0, y: 0, z: 25.5 },
        size: { x: 2.0, y: 0.4, z: 10.0 },
        color: '#eab308', // yellow-500
      },
      // 3. 安全ポイント① (Checkpoint 1 - Blue)
      {
        id: 'l1_checkpoint1',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: 18.0 },
        size: { x: 4.5, y: 0.4, z: 5.0 },
        color: '#3b82f6', // blue-500
        label: '【安全ポイント①】中間地点',
      },
      // 4. 第二一本道（徐々に細くなる - Split with another fun jumping gap!）
      {
        id: 'l1_bridge2_a',
        type: 'normal',
        position: { x: 0, y: 0, z: 9.25 },
        size: { x: 1.4, y: 0.4, z: 12.5 },
        color: '#f59e0b',
      },
      {
        id: 'l1_bridge2_b',
        type: 'normal',
        position: { x: 0, y: 0, z: -4.0 },
        size: { x: 1.4, y: 0.4, z: 7.0 },
        color: '#f59e0b',
        label: '穴を飛び越えよう！',
      },
      // 5. 左への接続コーナー (L-shape corner connection)
      {
        id: 'l1_corner1',
        type: 'normal',
        position: { x: -2.975, y: 0, z: -8.25 },
        size: { x: 4.55, y: 0.4, z: 1.5 },
        color: '#f59e0b',
      },
      // 6. 安全ポイント② (Checkpoint 2 - Blue)
      {
        id: 'l1_checkpoint2',
        type: 'checkpoint',
        position: { x: -3.0, y: 0, z: -11.25 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【安全ポイント②】最終カーブ手前',
      },
      // 7. 追加された延伸エリア：蛇行する天空回廊
      {
        id: 'l1_bridge_extra1',
        type: 'normal',
        position: { x: -3.0, y: 0, z: -25.125 },
        size: { x: 1.2, y: 0.4, z: 23.25 },
        color: '#eab308', // yellow-500
        label: 'クネクネ蛇行一本道',
      },
      // 8. 追加安全ポイント③ (Checkpoint 3 - Blue)
      {
        id: 'l1_checkpoint3',
        type: 'checkpoint',
        position: { x: -3.0, y: 0, z: -39.0 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【追加安全ポイント③】ラストスパート',
      },
      // 9. 右への接続コーナー (Connection to l1_bridge3)
      {
        id: 'l1_corner2',
        type: 'normal',
        position: { x: -2.875, y: 0, z: -41.875 },
        size: { x: 4.75, y: 0.4, z: 1.25 },
        color: '#f59e0b',
      },
      // 10. 最終アプローチ（ちょっとした曲がり道）
      {
        id: 'l1_bridge3',
        type: 'normal',
        position: { x: -1.0, y: 0, z: -49.875 },
        size: { x: 1.0, y: 0.4, z: 14.75 },
        color: '#f59e0b',
      },
      // 11. ゴール地点 (Goal Zone - Red)
      {
        id: 'l1_goal',
        type: 'goal',
        position: { x: -1.0, y: 0, z: -60.0 },
        size: { x: 5.5, y: 0.4, z: 5.5 },
        color: '#ef4444', // red-500
        label: 'ゴール！おめでとう！',
      },
    ],
    obstacles: [],
  },
  {
    id: 2,
    name: '吹き荒れる天空の風路',
    description: '巨大送風機から吹き荒れる激しい突風と、滑りやすいアイスロード！大幅に延伸され、4箇所の安全ポイントで息を整えながら、難攻不落の風に挑め！',
    difficulty: 'Medium',
    startPos: { x: 0, y: 1.5, z: 50 },
    recommendedTime: 95,
    gravity: 0.95,
    platforms: [
      // 1. スタート地点 (Start Zone)
      {
        id: 'l2_start',
        type: 'normal',
        position: { x: 0, y: 0, z: 50 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#4ade80',
      },
      // 2. 第一風の橋 (Split with a wind-shear jump gap!)
      {
        id: 'l2_bridge1_a',
        type: 'normal',
        position: { x: 0, y: 0, z: 41.75 },
        size: { x: 1.4, y: 0.4, z: 12.0 },
        color: '#f59e0b',
        label: '右からの強風に注意！',
      },
      {
        id: 'l2_bridge1_b',
        type: 'normal',
        position: { x: 0, y: 0, z: 30.625 },
        size: { x: 1.4, y: 0.4, z: 1.75 },
        color: '#f59e0b',
      },
      // 3. 安全ポイント① (Checkpoint 1)
      {
        id: 'l2_checkpoint1',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: 27.5 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【安全ポイント①】第一風路突破',
      },
      // 4. 第二アイスロード（氷の滑る橋 - Fully flat at y: 0 with a jump entry and elegant gaps!）
      {
        id: 'l2_ice_bridge',
        type: 'slippery',
        position: { x: 0, y: 0, z: 14.125 },
        size: { x: 1.5, y: 0.4, z: 18.75 },
        color: '#a5f3fc', // cyan-200 (氷)
        label: 'アイスロード（非常に滑りやすい）',
      },
      // 5. 安全ポイント② (Checkpoint 2)
      {
        id: 'l2_checkpoint2',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: 2.5 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【安全ポイント②】アイスストリート終点',
      },
      // 6. 左への接続コーナー (Connection to l2_bridge_extra1)
      {
        id: 'l2_corner1',
        type: 'normal',
        position: { x: -1.8, y: 0, z: -0.375 },
        size: { x: 3.6, y: 0.4, z: 1.25 },
        color: '#f59e0b',
      },
      // 7. 追加された延伸風路 (New Extension Wind Road)
      {
        id: 'l2_bridge_extra1',
        type: 'normal',
        position: { x: -3.0, y: 0, z: -10.75 },
        size: { x: 1.2, y: 0.4, z: 19.5 },
        color: '#f59e0b',
        label: '左から吹く第二の防風ゾーン！',
      },
      // 8. 追加安全ポイント③ (Checkpoint 3)
      {
        id: 'l2_checkpoint3',
        type: 'checkpoint',
        position: { x: -3.0, y: 0, z: -22.75 },
        size: { x: 4.0, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【追加安全ポイント③】強風の合間',
      },
      // 9. 斜走路接続コーナー (Connection to l2_ice2)
      {
        id: 'l2_corner2',
        type: 'normal',
        position: { x: -3.0, y: 0, z: -25.25 },
        size: { x: 4.0, y: 0.4, z: 0.5 },
        color: '#f59e0b',
      },
      // 10. 最終極細一本橋へのスライド斜走路 (Ice 2 - Fully flat at y: 0)
      {
        id: 'l2_ice2',
        type: 'slippery',
        position: { x: -1.5, y: 0, z: -36.125 },
        size: { x: 1.0, y: 0.4, z: 21.25 },
        color: '#a5f3fc',
      },
      // 11. ラストストレートへの接続コーナー (Connection to checkpoint4)
      {
        id: 'l2_corner3',
        type: 'normal',
        position: { x: 0, y: 0, z: -46.875 },
        size: { x: 4.0, y: 0.4, z: 0.25 },
        color: '#f59e0b',
      },
      // 12. 追加安全ポイント④ (Checkpoint 4)
      {
        id: 'l2_checkpoint4',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: -49.0 },
        size: { x: 4.0, y: 0.4, z: 4.0 },
        color: '#3b82f6',
        label: '【最終安全ポイント④】ゴールが見えます！',
      },
      // 13. 第三極細ロード（ニードル）
      {
        id: 'l2_bridge2',
        type: 'normal',
        position: { x: 0, y: 0, z: -58.5 },
        size: { x: 0.7, y: 0.4, z: 15.0 },
        color: '#ef4444',
      },
      // 14. ゴール地点
      {
        id: 'l2_goal',
        type: 'goal',
        position: { x: 0, y: 0, z: -68.75 },
        size: { x: 5.5, y: 0.4, z: 5.5 },
        color: '#ef4444',
      },
    ],
    obstacles: [
      {
        id: 'l2_wind1',
        type: 'wind_blower',
        position: { x: -7.0, y: 0.8, z: 38.5 },
        size: { x: 1.5, y: 1.5, z: 1.5 },
        color: '#06b6d4',
        direction: { x: 1, y: 0, z: 0 },
        range: 14,
        speed: 3.5,
        phase: 0,
      },
      {
        id: 'l2_wind2',
        type: 'wind_blower',
        position: { x: 6.5, y: 0.8, z: 15.0 },
        size: { x: 1.5, y: 1.5, z: 1.5 },
        color: '#06b6d4',
        direction: { x: -1, y: 0, z: 0 },
        range: 13,
        speed: 2.4,
        phase: Math.PI,
      },
      {
        id: 'l2_wind_extra',
        type: 'wind_blower',
        position: { x: -10.0, y: 0.8, z: -10.0 },
        size: { x: 1.5, y: 1.5, z: 1.5 },
        color: '#06b6d4',
        direction: { x: 1, y: 0, z: 0 },
        range: 15,
        speed: 4.2,
        phase: Math.PI / 2,
      },
    ],
  },
  {
    id: 3,
    name: 'スライド・クロッシング',
    description: 'タイミング勝負！左右にダイナミックに動く「スライド一本橋」と「障害物」の大型空中アスレチック。乗った床の動きと同化して、安全ポイントを確保し前進せよ！',
    difficulty: 'Hard',
    startPos: { x: 0, y: 1.5, z: 50 },
    recommendedTime: 95,
    gravity: 0.95,
    platforms: [
      // 1. スタート
      {
        id: 'l3_start',
        type: 'normal',
        position: { x: 0, y: 0, z: 50 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#4ade80',
      },
      // 2. 第一ブリッジ (With a beautiful jump gap onto the moving platform!)
      {
        id: 'l3_bridge1_a',
        type: 'normal',
        position: { x: 0, y: 0, z: 42.125 },
        size: { x: 1.5, y: 0.4, z: 11.25 },
        color: '#f59e0b',
        label: '動く床へ向かって大ジャンプ！',
      },
      // 3. 動くスライド橋① (Moving 1)
      {
        id: 'l3_moving1',
        type: 'normal',
        position: { x: 0, y: 0, z: 26.0 },
        size: { x: 1.4, y: 0.4, z: 11.0 },
        color: '#ec4899', // pink-500
        movement: {
          axis: 'x',
          range: 3.6,
          speed: 1.4,
          phase: 0,
        },
        label: '動く床！乗ると一緒にスライドします',
      },
      // 4. 安全ポイント①
      {
        id: 'l3_checkpoint1',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: 18.25 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【安全ポイント①】第一関門クリア',
      },
      // 5. 第二ブリッジ (Split with an exciting jump gap in the middle)
      {
        id: 'l3_bridge2_a',
        type: 'normal',
        position: { x: 0, y: 0, z: 10.25 },
        size: { x: 1.4, y: 0.4, z: 11.5 },
        color: '#f59e0b',
      },
      {
        id: 'l3_bridge2_b',
        type: 'normal',
        position: { x: 0, y: 0, z: -2.25 },
        size: { x: 1.4, y: 0.4, z: 4.5 },
        color: '#f59e0b',
        label: '障害物の手前でジャンプ！',
      },
      // 6. 動くスライド橋② (Moving 2)
      {
        id: 'l3_moving2',
        type: 'normal',
        position: { x: 0, y: 0, z: -9.0 },
        size: { x: 1.2, y: 0.4, z: 9.0 },
        color: '#ec4899',
        movement: {
          axis: 'x',
          range: 4.5,
          speed: 1.8,
          phase: Math.PI / 2,
        },
      },
      // 7. 安全ポイント②
      {
        id: 'l3_checkpoint2',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: -15.75 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【安全ポイント②】中間大プラットフォーム',
      },
      // Mid bridge 3
      {
        id: 'l3_bridge3_mid',
        type: 'normal',
        position: { x: 0, y: 0, z: -20.375 },
        size: { x: 1.4, y: 0.4, z: 4.75 },
        color: '#f59e0b',
      },
      // 8. 延伸エリア：動くスライド橋③ (New Moving 3)
      {
        id: 'l3_moving3',
        type: 'normal',
        position: { x: 0, y: 0, z: -26.0 },
        size: { x: 1.2, y: 0.4, z: 6.5 },
        color: '#ec4899',
        movement: {
          axis: 'x',
          range: 5.0,
          speed: 1.5,
          phase: Math.PI,
        },
      },
      // Mid bridge 3_2
      {
        id: 'l3_bridge3_mid2',
        type: 'normal',
        position: { x: 0, y: 0, z: -32.125 },
        size: { x: 1.4, y: 0.4, z: 5.75 },
        color: '#f59e0b',
      },
      // 9. 追加安全ポイント③ (New Checkpoint 3)
      {
        id: 'l3_checkpoint3',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: -37.25 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#3b82f6',
        label: '【追加安全ポイント③】高速移動前の静寂',
      },
      // Mid bridge 3_3
      {
        id: 'l3_bridge3_mid3',
        type: 'normal',
        position: { x: 0, y: 0, z: -42.875 },
        size: { x: 1.4, y: 0.4, z: 6.75 },
        color: '#f59e0b',
      },
      // 10. 延伸エリア：高速スライド橋④ (New High-speed Moving 4)
      {
        id: 'l3_moving4',
        type: 'normal',
        position: { x: 0, y: 0, z: -49.5 },
        size: { x: 1.0, y: 0.4, z: 6.5 },
        color: '#e11d48', // rose-600
        movement: {
          axis: 'x',
          range: 4.5,
          speed: 2.3,
          phase: -Math.PI / 4,
        },
      },
      // Mid bridge 3_4
      {
        id: 'l3_bridge3_mid4',
        type: 'normal',
        position: { x: 0, y: 0, z: -55.875 },
        size: { x: 1.4, y: 0.4, z: 6.25 },
        color: '#f59e0b',
      },
      // 11. 追加安全ポイント④ (Checkpoint 4)
      {
        id: 'l3_checkpoint4',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: -61.0 },
        size: { x: 4.0, y: 0.4, z: 4.0 },
        color: '#3b82f6',
        label: '【最終安全ポイント④】ゴールは目の前！',
      },
      // 12. 最終ブリッジ (Split with an awesome final leap of faith gap!)
      {
        id: 'l3_bridge_final_a',
        type: 'normal',
        position: { x: 0, y: 0, z: -68.0 },
        size: { x: 1.0, y: 0.4, z: 10.0 },
        color: '#f59e0b',
      },
      {
        id: 'l3_bridge_final_b',
        type: 'normal',
        position: { x: 0, y: 0, z: -80.5 },
        size: { x: 1.0, y: 0.4, z: 5.0 },
        color: '#f59e0b',
        label: 'ラスト大ジャンプ！',
      },
      // 13. ゴール
      {
        id: 'l3_goal',
        type: 'goal',
        position: { x: 0, y: 0, z: -85.75 },
        size: { x: 5.5, y: 0.4, z: 5.5 },
        color: '#ef4444',
      },
    ],
    obstacles: [
      {
        id: 'l3_sweeper1',
        type: 'slider',
        position: { x: 0, y: 0.5, z: 7.5 },
        size: { x: 1.8, y: 0.6, z: 0.8 },
        color: '#ef4444',
        direction: { x: 1, y: 0, z: 0 },
        range: 3.8,
        speed: 1.8,
        phase: 0,
      },
      {
        id: 'l3_sweeper2',
        type: 'slider',
        position: { x: 0, y: 0.5, z: -69.0 },
        size: { x: 1.6, y: 0.6, z: 0.8 },
        color: '#f43f5e',
        direction: { x: 1, y: 0, z: 0 },
        range: 3.5,
        speed: 2.2,
        phase: Math.PI / 3,
      },
    ],
  },
  {
    id: 4,
    name: '雲海ジャンプ＆超加速',
    description: '青色のブースターで猛スピードへ急加速！さらに長く延伸された広大な大雲海を３回の大ジャンプで飛び越えよう。要所には安全トランポリンと合計3箇所の安全ポイントを完備。',
    difficulty: 'Hard',
    startPos: { x: 0, y: 1.5, z: 45 },
    recommendedTime: 95,
    gravity: 1.05, // precision gravity arc
    platforms: [
      // 1. スタート
      {
        id: 'l4_start',
        type: 'normal',
        position: { x: 0, y: 0, z: 45 },
        size: { x: 4.5, y: 0.4, z: 4.5 },
        color: '#4ade80',
      },
      // 2. 助走ロード
      {
        id: 'l4_bridge_runup',
        type: 'normal',
        position: { x: 0, y: 0, z: 32.75 },
        size: { x: 1.8, y: 0.4, z: 20.0 },
        color: '#f59e0b',
        label: 'いざ、目の前の加速盤へ！',
      },
      // 3. ブースター床① (Booster 1)
      {
        id: 'l4_booster1',
        type: 'booster',
        position: { x: 0, y: 0, z: 20.0 },
        size: { x: 2.2, y: 0.4, z: 5.5 },
        color: '#3b82f6',
        label: '超★加速ブースター！(自動大ジャンプ)',
      },
      // 4. 空中の谷を大きく飛び越え、トランポリン着地
      {
        id: 'l4_trampoline1',
        type: 'bouncy',
        position: { x: 0, y: -0.5, z: -2.0 },
        size: { x: 4.5, y: 0.4, z: 9.5 },
        color: '#a855f7', // purple
        label: '（バウンド大着地盤）しっかり制御！',
      },
      // 5. 安全ポイント① (Separated from bouncy trampoline to prevent seam friction!)
      {
        id: 'l4_checkpoint1',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: -11.25 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#3b82f6',
        label: '【安全ポイント①】ジャンプ初級成功',
      },
      // 6. 第二助走
      {
        id: 'l4_bridge_runup2',
        type: 'normal',
        position: { x: 0, y: 0, z: -24.5 },
        size: { x: 1.5, y: 0.4, z: 21.5 },
        color: '#f59e0b',
      },
      // 7. ブースター床②
      {
        id: 'l4_booster2',
        type: 'booster',
        position: { x: 0, y: 0, z: -38.0 },
        size: { x: 2.0, y: 0.4, z: 5.5 },
        color: '#3b82f6',
        label: 'さらに極限大ブースト！(第２大ジャンプ)',
      },
      // 8. 巨大な第二 bouncy trampoline 2
      {
        id: 'l4_trampoline2',
        type: 'bouncy',
        position: { x: 0, y: -1.0, z: -57.0 },
        size: { x: 5.5, y: 0.4, z: 12.5 },
        color: '#a855f7',
        label: '（超大バウンド盤）',
      },
      // 9. 安全ポイント② (Separated from bouncy trampoline to prevent seam friction!)
      {
        id: 'l4_checkpoint2',
        type: 'checkpoint',
        position: { x: 0, y: -0.5, z: -67.75 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#3b82f6',
        label: '【安全ポイント②】第二ジャンプ完全走覇！',
      },
      // 10. 延伸追加：第三助走ロード
      {
        id: 'l4_bridge_runup3',
        type: 'normal',
        position: { x: 0, y: -0.5, z: -82.25 },
        size: { x: 1.5, y: 0.4, z: 24.0 },
        color: '#eab308',
      },
      // 11. 追加ブースター床③ (Booster 3)
      {
        id: 'l4_booster3',
        type: 'booster',
        position: { x: 0, y: -0.5, z: -97.25 },
        size: { x: 2.0, y: 0.4, z: 6.0 },
        color: '#3b82f6',
        label: 'ウルトララスト大ブースト！',
      },
      // 12. 第三の跳躍、Y=-2.0に配置された巨大安全トランポリン３へ着地
      {
        id: 'l4_trampoline3',
        type: 'bouncy',
        position: { x: 0, y: -2.0, z: -121.0 },
        size: { x: 6.0, y: 0.4, z: 19.0 },
        color: '#a855f7',
        label: '最後のバウンド衝撃吸収！',
      },
      // 13. 追加安全ポイント③ (Separated from bouncy trampoline to prevent seam friction!)
      {
        id: 'l4_checkpoint3',
        type: 'checkpoint',
        position: { x: 0, y: -1.0, z: -135.0 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#3b82f6',
        label: '【安全ポイント③】すべての跳躍がおわりました！',
      },
      // 14. 最終アプローチ極細一本橋
      {
        id: 'l4_needle',
        type: 'normal',
        position: { x: 0, y: -1.0, z: -146.5 },
        size: { x: 0.8, y: 0.4, z: 18.0 },
        color: '#f59e0b',
      },
      // 15. ゴール
      {
        id: 'l4_goal',
        type: 'goal',
        position: { x: 0, y: -1.0, z: -158.25 },
        size: { x: 5.5, y: 0.4, z: 5.5 },
        color: '#ef4444',
      },
    ],
    obstacles: [],
  },
  {
    id: 5,
    name: '雲上の迷宮アスレチック',
    description: '動く床、滑る氷、強風、作用る斜め大ジャンプ！すべてのテクニックが試される超々長距離の究極最終試練。3つの安全ポイントを足がかりに完全クリアを掴み取れ！',
    difficulty: 'Expert',
    startPos: { x: 0, y: 1.5, z: 50 },
    recommendedTime: 120,
    gravity: 0.95,
    platforms: [
      // 1. スタート (Y=0)
      {
        id: 'l5_start',
        type: 'normal',
        position: { x: 0, y: 0, z: 50 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#4ade80',
      },
      // 2. 第一アイスロード (Fully flat at y: 0 with seamless transition)
      {
        id: 'l5_ice1',
        type: 'slippery',
        position: { x: 0, y: 0, z: 38.5 },
        size: { x: 1.4, y: 0.4, z: 18.0 },
        color: '#a5f3fc',
        label: '滑りながら進もう',
      },
      // 3. 第一スライド移動床
      {
        id: 'l5_moving1',
        type: 'normal',
        position: { x: 0, y: 0, z: 23.5 },
        size: { x: 1.2, y: 0.4, z: 12.0 },
        color: '#ec4899',
        movement: {
          axis: 'x',
          range: 4.2,
          speed: 1.5,
          phase: 0,
        },
      },
      // 4. 安全ポイント①
      {
        id: 'l5_checkpoint1',
        type: 'checkpoint',
        position: { x: 0, y: 0, z: 15.0 },
        size: { x: 5.0, y: 0.4, z: 5.0 },
        color: '#3b82f6',
        label: '【安全ポイント①】前半クリア',
      },
      // Connection bridge from checkpoint1 to side ice bridge
      {
        id: 'l5_bridge_side_connect',
        type: 'normal',
        position: { x: 0, y: 0, z: 11.75 },
        size: { x: 1.4, y: 0.4, z: 1.5 },
        color: '#f59e0b',
      },
      // 5. 巨大アイスブリッジ (大幅に左 X=-7 へ折り返し)
      {
        id: 'l5_bridge_side',
        type: 'slippery',
        position: { x: -2.4, y: 0, z: 10.0 },
        size: { x: 6.2, y: 0.4, z: 2.0 },
        color: '#a5f3fc',
        label: '横断アイスブリッジ（横風注意！）',
      },
      // 6. 安全ポイント② (折り返した先の左側 X=-7.5 に設置)
      {
        id: 'l5_checkpoint2',
        type: 'checkpoint',
        position: { x: -7.5, y: 0, z: 10.0 },
        size: { x: 4.0, y: 0.4, z: 4.0 },
        color: '#3b82f6',
        label: '【安全ポイント②】風を切り開いた先',
      },
      // 7. 左側の極細ストレート
      {
        id: 'l5_passage',
        type: 'normal',
        position: { x: -7.5, y: 0, z: -1.0 },
        size: { x: 0.8, y: 0.4, z: 18.0 },
        color: '#f59e0b',
      },
      // 8. 延伸エリア：第二スライド床 (New Moving 2)
      {
        id: 'l5_moving2',
        type: 'normal',
        position: { x: -7.5, y: 0, z: -16.0 },
        size: { x: 1.1, y: 0.4, z: 12.0 },
        color: '#ec4899',
        movement: {
          axis: 'x',
          range: 3.5,
          speed: 1.8,
          phase: Math.PI / 2,
        },
      },
      // 9. 追加安全ポイント③ (New Checkpoint 3)
      {
        id: 'l5_checkpoint3',
        type: 'checkpoint',
        position: { x: -7.5, y: 0, z: -24.0 },
        size: { x: 4.0, y: 0.4, z: 4.0 },
        color: '#3b82f6',
        label: '【追加安全ポイント③】斜め大ジャンプジャッカー',
      },
      // Connection bridge to skew booster
      {
        id: 'l5_passage2',
        type: 'normal',
        position: { x: -7.5, y: 0, z: -27.0 },
        size: { x: 1.0, y: 0.4, z: 2.0 },
        color: '#f59e0b',
      },
      // 10. 斜めブースター
      {
        id: 'l5_booster_skew',
        type: 'booster',
        position: { x: -7.5, y: 0, z: -31.0 },
        size: { x: 1.8, y: 0.4, z: 6.0 },
        color: '#3b82f6',
        label: '斜め大跳躍！(右前方へ！)',
      },
      // 11. 空中を大きく右にフライ、右側のトランポリンへ着地
      {
        id: 'l5_trampoline',
        type: 'bouncy',
        position: { x: 5.0, y: -1.0, z: -53.0 },
        size: { x: 5.5, y: 0.4, z: 15.0 },
        color: '#a855f7',
        label: '見事着地！最後は超針の橋へ',
      },
      // 12. 追加安全ポイント④ (Separated from bouncy trampoline to prevent seam friction!)
      {
        id: 'l5_checkpoint4',
        type: 'checkpoint',
        position: { x: 5.0, y: -1.0, z: -65.5 },
        size: { x: 4.0, y: 0.4, z: 6.0 },
        color: '#3b82f6',
        label: '【最終安全ポイント-制覇目近】',
      },
      // 13. 最終針の橋 (X=5.0)
      {
        id: 'l5_needle_final',
        type: 'normal',
        position: { x: 5.0, y: -1.0, z: -80.0 },
        size: { x: 0.6, y: 0.4, z: 23.0 },
        color: '#ef4444',
      },
      // 14. ゴール(X=5.0)
      {
        id: 'l5_goal',
        type: 'goal',
        position: { x: 5.0, y: -1.0, z: -94.25 },
        size: { x: 5.0, y: 0.4, z: 5.5 },
        color: '#ef4444',
        label: 'オール完全クリア！！お疲れ様でした！',
      },
    ],
    obstacles: [
      {
        id: 'l5_wind1',
        type: 'wind_blower',
        position: { x: -11.5, y: 0.8, z: 10.0 },
        size: { x: 1.5, y: 1.5, z: 1.5 },
        color: '#06b6d4',
        direction: { x: 1, y: 0, z: 0 },
        range: 12,
        speed: 2.5,
        phase: 0,
      },
      {
        id: 'l5_sweeper',
        type: 'slider',
        position: { x: 5.0, y: -0.5, z: -78.5 },
        size: { x: 1.6, y: 0.5, z: 0.6 },
        color: '#f43f5e',
        direction: { x: 1, y: 0, z: 0 },
        range: 3.2,
        speed: 2.2,
        phase: Math.PI / 2,
      },
    ],
  },
];
