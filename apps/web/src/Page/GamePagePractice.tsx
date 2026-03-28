import { useMemo, useReducer, useState, useRef, useEffect, act } from "react";
import { createDefaultDeps, createInitialState, reduce } from "@ladder-duel/shared";
import type { GameState, GameAction, PlayerId, CardId } from "@ladder-duel/shared";
import "./GamePage_refactor.css";


type PlayerColor = "red" | "blue";
const COLOR_OPTIONS: PlayerColor[] = ["red", "blue"];

export default function GamePage_practice() {
  // Args: 無。整個遊戲頁面的根元件。
  // 用途:
  // - 建立 reducer state 與 deps
  // - 計算 UI 需要的 selector
  // - 管理本地 UI state（如角色顏色選擇器）
  // - 組合各區塊元件：Game Info / Player Panels / Gallery / Operate Panel / Log Panel
  //
  // 需要改寫的內容邏輯（相較原始 GamePage.tsx）：
  // 1. 不要在 useMemo 中直接 createInitialState(createDefaultDeps()) 後再用外部無 deps 的 reduceFn；
  //    應先建立穩定的 deps，再把 deps 注入 reduce 與 createInitialState，確保整個遊戲生命週期使用同一組依賴。
  // 2. 將 UI 排版從「平鋪式 JSX」重構成明確區塊：
  //    - Character Picker Anchor
  //    - Main Column
  //    - Game Info Panel
  //    - Arena Row（P1 / Gallery / P2）
  //    - Operate Panel
  //    - Log Panel
  // 3. 將原本分散、命名不一致或邏輯不足的狀態整理成清楚 selector：
  //    - attacker / defender / phase
  //    - handAttacker / handDefender / currentHand
  //    - needDiscard
  //    - canPlayInAction / canPlayInReaction
  //    - winnerText
  //    - can（各 action 是否允許）
  // 4. onChange 需改為 immutable update，不能直接改寫原本 state 物件。
  // 5. executeDispatchFn 不應保留在重構版主流程中；
  //    應改由各子元件直接 dispatch 正確的 GameAction，避免硬編碼 MULTIPLER / card key 錯誤。
  // 6. JSX 回傳結構需與目標版一致，並對應 CSS className。

  // Step 1: 建立穩定 deps（只初始化一次）
  const deps = useMemo(() => {
    // TODO
    // 實作方向:
    // - 呼叫 createDefaultDeps()
    // - 讓 deps 在整個 component 生命週期內保持穩定
    // - 使用 useMemo + 空 dependency array
    return createDefaultDeps();
  }, []);

  // Step 2: 建立 reducer state
  const [state, dispatch] = useReducer(
    (s: GameState, a: GameAction) => {
      // TODO
      // 實作方向:
      // - 使用 shared reduce
      // - 將 deps 傳入 reduce(s, a, deps)
      // - 不要使用未注入 deps 的舊版 reduceFn
      return reduce(s, a, deps);
    },
    undefined,
    () => {
      // TODO
      // 實作方向:
      // - 使用 createInitialState(deps)
      // - 注意原始檔拼字為 createInitalState，重構版應對齊 shared engine 的正確 API
      return createInitialState(deps);
    }
  );

  // ===== Necessary Selector & Derived UI State =====

  const attacker = state.turnCtx.attacker;
  const defender = state.turnCtx.defender;
  const phase = state.phase;

  const handAttacker: CardId[] = state.players[attacker].hand;
  const handDefender: CardId[] = state.players[defender].hand;
  const currentHand: CardId[] = state.players[state.currentPlayer].hand;

  const needDiscard: boolean = useMemo(() => {
    // Args: 無（使用外部 phase / currentHand.length）
    // 用途: 判斷目前是否需要進入棄牌流程。
    //
    // 需要改寫的內容邏輯:
    // 1. 原始版沒有明確做 DRAW + hand size 條件封裝。
    // 2. 重構版應把「是否需要棄牌」抽成 selector，避免散落在 JSX 中判斷。
    // 3. 規則對齊目標版：只有在 DRAW phase 且 currentPlayer 手牌超過 5 時，才需要棄回 5 張。
    // TODO
    return phase === "DRAW" && currentHand.length > 5;
  }, [/*TODO: 判別當哪些內容變動時需要重新判別棄牌*/phase,currentHand]);

  const canPlayInAction: boolean = phase === "ACTION" && !state.turnCtx.attackerCard;
  const canPlayInReaction: boolean = phase === "REACTION" && !state.turnCtx.defenderCard;
  const winnerText: string = state.winner ? `Winner: ${state.winner}` : "Winner: (none)";

  const can: Record<string, boolean> = useMemo(() => {
    // Args: 無（使用外部 state / phase / needDiscard）
    // 用途: 集中管理按鈕可不可按。
    //
    // 需要改寫的內容邏輯:
    // 1. 原始版 can 的 key 與 phase 支援不完整，沒有 REACTION_SKIP，也沒有區分 ACTION_SKIP / REACTION_SKIP。
    // 2. 重構版要依 phase 與 winner 狀態產生更精確的 UI 控制。
    //    涵蓋內容:
    //    2.1 ACTION_SKIP 只能在 ACTION phase 且無 winner 時按。
    //    2.2 ROLL_DICE 只能在 ROLL phase 且無 winner 時按。
    //    2.3 REACTION_SKIP 只能在 REACTION phase 且無 winner 時按。
    //    2.4 RESOLVE_ROLL 只能在 RESOLVE phase 且無 winner 時按。
    //    2.5 DRAW_CARD 只能在 DRAW phase 且無 winner 時按，且當 needDiscard 為 true 時不能按（必須先棄牌）。
    //    2.6 END_TURN 只能在 END phase 且無 winner 時按。
    // 3. DRAW_CARD 必須在 needDiscard 為 false 時才能按，避免玩家尚未棄牌就繼續流程。
    // 4. RESET 保持永遠可用。
    // TODO
    const hasWinner: boolean = state.winner !== undefined;
    return {
      // TODO: 根據上述規則實作 can 的各個 key
      ACTION_SKIP: phase==="ACTION"&&!hasWinner,
      ROLL_DICE: phase==="ROLL"&&!hasWinner,
      REACTION_SKIP:phase==="REACTION"&&!hasWinner,
      RESOLVE_ROLL:phase==="RESOLVE"&&!hasWinner,
      DRAW_CARD:phase==="DRAW"&&!hasWinner&&needDiscard===false,
      END_CARD:phase==="END"&&!hasWinner                                                
    };
  }, [state, phase, needDiscard]);

  // ===== Local UI State =====

  const [colorPickerState, setColorPickerState] = useState<boolean>(false);
  const [playerColor, setPlayerColor] = useState<Record<PlayerId, PlayerColor>>({
    P1: "blue",
    P2: "red",
  });

  function onChange(player: PlayerId, color: PlayerColor) {
    // Args:
    // - player: 要被修改顏色的玩家（P1 / P2）
    // - color: 新的顏色值
    //
    // 用途:
    // - 更新 playerColor state，使 Gallery 與 CharacterPicker 可反映最新顏色。
    //
    // 需要改寫的內容邏輯:
    // 1. 原始版錯誤做法：
    //    - 先令 const nPlayerColor = playerColor
    //    - 再直接改 nPlayerColor[player] = color
    //    - 最後 setPlayerColor(nPlayerColor)
    //    這會直接 mutation 舊 state，React 可能不會正確 re-render。
    // 2. 正確做法應使用 functional update，回傳一個新的物件。
    // 3. 必須保留另一位玩家的原始顏色，只更新指定 player 對應欄位。
    // TODO

    let newPlayerColor={
      ...playerColor
    }

    newPlayerColor[player]=color
    setPlayerColor(newPlayerColor);

  }

  return (
    <div className="game-page">
      {/*
        需要新增的結構：character-picker-anchor
        用途:
        - 固定放置 CharacterPicker toggle button 與彈出內容
        - 對應右上角位置與 CSS layout
      */}
      <div className="character-picker-anchor">
        <button
          className="picker-toggle"
          onClick={() => {
            // HW 22
            // TODO
            // 實作方向:
            // - 切換 colorPickerState true / false
            setColorPickerState(!colorPickerState);
          }}
        > 
          Character
        </button>

        <CharacterPicker
          open={colorPickerState}
          value={playerColor}
          onChange={onChange}
          onClose={() => {
            // HW 22
            // TODO
            // 實作方向:
            // - 明確關閉 picker，而不是再切一次 toggle
            setColorPickerState(false)

          }}
        />
      </div>

      <main className="game-main-column">
        <section className="panel info-panel">
          {/*
            需要改寫的內容邏輯:
            1. 原始版只有零散的 <p> 顯示 turn / position / roll。
            2. 重構版應整理成 Game Info Panel，集中顯示 winner / turn / phase / attacker / defender。
            3. 可讀性要高，且與 Gallery 對齊。
          */}
          <h3>Game Info</h3>
          <div className="info-row">
            <div>{winnerText}</div>
          </div>
          <div className="info-row">
            {/*HW 22: TODO: 顯示 Turn/ Phase / Attacker / Defender 訊息*/}
            <p>Attacker: {attacker}, Phase: {phase}, Defender: {defender}, Turn: {turn}</p>

          </div>
        </section>

        <section className="arena-row">
          <PlayerInfoPanel
            {/*HW 22 TODO: 顯示玩家資訊: 給予正確參數*/}

          />

          <div className="gallery-shell">
            <Gallery
              p1Color={playerColor.P1}
              p2Color={playerColor.P2}
              p1Level={state.players.P1.position}
              p2Level={state.players.P2.position}
              maxLevel={120}
              width={780}
              height={560}
            />
          </div>

          <PlayerInfoPanel
            {/*HW 22 TODO: 顯示玩家資訊: 給予正確參數*/}
          />
        </section>

        <OperatePanel
          {/*TODO:給予正確參數*/}

        />
      </main>

      <LogPanel log={state.log} />
    </div>
  );
}

interface CharacterPickerProps {
  open: boolean;
  value: Record<PlayerId, PlayerColor>;
  onChange: (player: PlayerId, color: PlayerColor) => void;
  onClose: () => void;
}

function CharacterPicker({ open, value, onChange, onClose }: CharacterPickerProps) {
  // Args:
  // - open: 是否顯示 picker
  // - value: 目前 P1 / P2 的顏色設定
  // - onChange: 通知外部更新顏色
  // - onClose: 通知外部關閉 picker
  //
  // 需要改寫的內容邏輯:
  // 1. 原始版錯誤地在 render 階段直接呼叫 changeColor()，這是 side effect，不可在 component body 直接做。
  // 2. if (!open) 時應回傳 null，而不是 return;（避免型別與 render 問題）。
  // 3. 原始版 JSX 結構不完整、P2 標題寫錯、重複硬編碼 button。
  // 4. 重構版應：
  //    - 用一致的 panel 結構
  //    - 用 COLOR_OPTIONS.map 渲染 P1 / P2 的按鈕
  //    - 顯示 active 狀態
  //    - 提供 Close 按鈕
  // 5. 不需要額外 changeColor() global function。

  if (!open) {
    return null;
  }

  return (
    <div className="picker-popover panel" role="dialog" aria-label="Character picker">
      <div className="picker-head">
        <h4>Character Picker</h4>
        <button className="picker-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="picker-player-row">
        <div className="picker-player-label">P1</div>
        <div className="picker-color-group">
          {COLOR_OPTIONS.map((color) => {
            // HW 22
            // TODO
            // 實作方向:
            // - 判斷目前 color 是否為 P1 已選值
            // - 若是，套用 active className
            // - 按下後呼叫 onChange("P1", color)
            if(color=P1.color){
              onchange("P1",color)
            }

            
          })}
        </div>
      </div>

      <div className="picker-player-row">
        <div className="picker-player-label">P2</div>
        <div className="picker-color-group">
          {COLOR_OPTIONS.map((color) => {
            // HW 22
            // TODO
            // 實作方向:
            // - 判斷目前 color 是否為 P2 已選值
            // - 若是，套用 active className
            // - 按下後呼叫 onChange("P2", color)
            if(color=P2.color){
              onchange("P2",color)
            }

          })}
        </div>
      </div>
    </div>
  );
}

interface PlayerInfoPanelProps {
  playerID: PlayerId;
  playerPosition: number;
  playerHand: CardId[];
}

function PlayerInfoPanel({ playerID, playerPosition, playerHand }: PlayerInfoPanelProps) {
  // 新增元件（原始檔對應概念是 CardPanel，但目標版重構成資訊更完整的 PlayerInfoPanel）
  // Args:
  // - playerID: 玩家 ID
  // - playerPosition: 玩家目前位置
  // - playerHand: 玩家目前手牌
  //
  // 用途:
  // - 統一顯示單一玩家的基本資訊與手牌摘要
  // - 取代原始版較鬆散的 CardPanel 結構
  //
  // 實作步驟:
  // 1. 使用 aside / panel 結構(HTML tag, search by your self)讓左右玩家面板語意清楚。
  // 2. 顯示 playerID、position、hand count。
  // 3. 若 playerHand 非空，列出卡牌清單。
  // 4. key 建議組合 playerID + card + index，避免重複。
  // HW 22 TODO

}

interface LogPanelProps {
  log: string[];
}

function LogPanel({ log }: LogPanelProps) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Args: 無（使用 ref 與 log）
    // 用途:
    // - 每次 log 更新後，自動捲動到最新訊息。
    //
    // 需要改寫的內容邏輯:
    // 1. 原始版只有靜態 LogPanel，沒有自動捲動到最新訊息。
    // 2. 重構版需透過 ref 取得 scroll container。
    // 3. 在 log 改變時，把 scrollTop 設為 scrollHeight。
    // TODO

  }, [log]);

  return (

  );
}

interface CardButtonsProps {
  disabled: boolean;
  player: PlayerId;
  hand: CardId[];
  dispatch: (a: GameAction) => void;
}

function CardButtons({ disabled, player, hand, dispatch }: CardButtonsProps) {
  // 元件用途:
  // - 負責渲染某位玩家目前手牌對應的操作區
  // - 將「出牌按鈕渲染邏輯」從 OperatePanel 中拆出，避免主面板過度膨脹
  // - 根據不同卡牌需求，決定是否直接 dispatch，或先顯示額外輸入 UI
  //
  // 與原始版差異:
  // - 原始 GamePage.tsx 沒有將這段邏輯獨立拆成 CardButtons
  // - 原本若統一透過單一 executeDispatchFn / button click handler 處理，
  //   會遇到不同卡牌需要不同 payload 的問題
  // - 因此重構後應把「卡牌種類判斷 + 特殊 payload 處理」集中封裝在這個元件內

  const [showSetRollInput, setShowSetRollInput] = useState(false);
  const [setRollValue, setSetRollValue] = useState<number>(0);

  // state 說明:
  // - showSetRollInput:
  //   控制是否顯示 SET_ROLL 專用的數值輸入區
  //   因為 SET_ROLL 不是按下按鈕就能直接出牌，還需要指定 0..6 的數值
  //
  // - setRollValue:
  //   暫存使用者對 SET_ROLL 輸入的數字
  //   最終 dispatch 前，仍應再次做 clamp / 驗證，避免非法值進入 reducer
  

  return (
    // TODO:
    // 你需要在這裡完成整個 JSX 結構。
    //
    // 建議實作順序如下:

    // Step 1. 建立最外層容器
    // - 使用一個外層 <div> 包住整個卡牌區域
    // - className 建議保留 "cardButtons"
    // - 此容器的責任是承載所有手牌按鈕與可能的額外輸入區

    // Step 2. 處理「沒有手牌」的狀況
    // - 若 hand.length === 0，顯示提示文字，例如 "(no cards)"
    // - 這個提示可放在一個 className="hint" 的元素中
    // - 目的: 避免畫面空白，讓玩家知道目前不是渲染錯誤，而是真的沒有牌

    // Step 3. 逐張走訪 hand
    // - 使用 hand.map(...) 渲染每一張手牌
    // - 每張牌都需要有穩定 key，常見做法是 `${cardId}-${idx}`
    // - 每張牌可以包在一個小的 <div> 中，方便之後附加特殊 UI（例如 SET_ROLL 的 input）
    //
    // 這一步中，你需要先判斷:
    // - 目前這張牌是不是 "SET_ROLL"
    //   例如:
    //   const isSetRoll = cardId === "SET_ROLL";

    // Step 4. 為每張牌渲染主要按鈕
    // - 按鈕文字可為 `Play ${cardId}`
    // - disabled 屬性應直接沿用 props.disabled
    // - 這個按鈕的 click 行為是本題核心
    //
    // click 邏輯請依照以下規則完成:

    // Case A. cardId === "SET_ROLL"
    // - 不能直接 dispatch
    // - 應先把 showSetRollInput 設為 true
    // - 然後直接 return，避免繼續執行後面的 dispatch 邏輯
    //
    // 原因:
    // - SET_ROLL 需要額外收集使用者指定的數字 chosen
    // - 因此它不是「一鍵立即出牌」型卡牌，而是「先開輸入區 -> 再確認」型卡牌

    // Case B. cardId === "MULTIPLIER"
    // - 需要 dispatch 一個 PLAY_CARD action
    // - 但除了基本欄位 type / player / cardId 以外，
    //   還需要額外帶 payload
    // - payload 應依 shared action 規格補上 factor
    // - 在教學版中，若規則尚未要求讓玩家自行選倍率，
    //   可先寫死為 factor: 2
    //
    // 也就是 dispatch 資料結構會像:
    // {
    //   type: "PLAY_CARD",
    //   player,
    //   cardId,
    //   payload: { factor: 2 }
    // }
    //
    // 原因:
    // - 這張牌與一般卡牌相比，多了一層參數需求
    // - 這正是為什麼不能只用一套無差別 dispatch 邏輯

    // Case C. 其他一般卡牌
    // - 直接 dispatch({ type: "PLAY_CARD", player, cardId })
    // - 不需要額外 payload
    //
    // 這是最基本的出牌流程

    // Step 5. 僅對 SET_ROLL 顯示額外輸入區
    // - 只有當前這張牌是 SET_ROLL，且 showSetRollInput === true 時，才顯示額外區塊
    // - 建議這塊 UI 放在該張牌按鈕下方，形成局部互動區
    //
    // 額外輸入區應包含:
    // 1. 一個 number input
    // 2. 一個 Confirm button

    // Step 6. 完成 number input 設定
    // - type="number"
    // - min={0}
    // - max={6}
    // - step={1}
    // - value 綁定 setRollValue
    //
    // onChange 邏輯:
    // 1. 先把 e.target.value 轉成 Number
    // 2. 再透過 clampInt(v, 0, 6) 限制範圍
    // 3. 最後更新 setSetRollValue(...)
    //
    // 原因:
    // - 雖然 input 已經設了 min/max，但那只是 UI 層面的限制
    // - 真正寫入 state 前仍應再次驗證
    // - 這樣 reducer / action payload 才比較安全

    // Step 7. 完成 Confirm button
    // - disabled 屬性仍沿用 props.disabled
    // - 點擊後要真正 dispatch SET_ROLL 對應的 PLAY_CARD action
    //
    // dispatch payload 規則:
    // {
    //   type: "PLAY_CARD",
    //   player,
    //   cardId: "SET_ROLL",
    //   payload: {
    //     chosen: clampInt(setRollValue, 0, 6)
    //   }
    // }
    //
    // 注意:
    // - 即使 setRollValue 在 input onChange 時已經 clamp 過一次，
    //   dispatch 前仍建議再 clamp 一次，形成最後一道保護
    //
    // Confirm 完成後的收尾動作:
    // 1. 將 showSetRollInput 設回 false，關閉輸入區

    // Step 8. 最後確認這個元件的責任邊界
    // - CardButtons 負責:
    //   1. 顯示玩家手牌
    //   2. 將不同卡牌需求轉成正確 dispatch
    //   3. 管理 SET_ROLL 的局部輸入 state
    //
    // - CardButtons 不負責:
    //   1. 決定現在是否輪到該玩家出牌（這應由上層透過 disabled 控制）
    //   2. 處理 reducer 規則
    //   3. 驗證 phase 合法性（那是 shared engine / reducer 的責任）

    // TODO: 請依上述步驟自行完成 JSX 與事件處理
    <></>
  );
}
interface OperatePanelProps {
  can: Record<string, boolean>;
  state: GameState;
  attacker: PlayerId;
  handAttacker: CardId[];
  defender: PlayerId;
  handDefender: CardId[];
  canPlayInAction: boolean;
  canPlayInReaction: boolean;
  dispatch: (a: GameAction) => void;
  needDiscard: boolean;
}

function OperatePanel({
  can,
  state,
  attacker,
  handAttacker,
  defender,
  handDefender,
  canPlayInAction,
  canPlayInReaction,
  dispatch,
  needDiscard,
}: OperatePanelProps) {
  // Args:
  // - can: 各操作按鈕的可用權限集合。通常是上層依照 phase / currentPlayer / engine 規則計算後傳入。
  // - state: 完整遊戲狀態。這裡主要會用到 phase、currentPlayer，以及玩家手牌資訊。
  // - attacker / defender: 當前回合的攻擊方與防守方。
  // - handAttacker / handDefender: 攻守雙方目前手牌，供 Play Card Panel 渲染。
  // - canPlayInAction / canPlayInReaction: 控制在 ACTION / REACTION window 中是否允許出牌。
  // - dispatch: reducer dispatch，用來送出各種遊戲 action。
  // - needDiscard: 是否進入「抽到 6 張後，必須先棄到 5 張」的狀態。
  //
  // 元件用途:
  // - 作為整個遊戲主操作區
  // - 負責承載兩大類內容:
  //   1. 常駐操作按鈕（skip / roll / resolve / draw / end / reset）
  //   2. 條件式面板（Play Card Panel / Discard Card Panel）
  //
  // 與原始版差異:
  // - 原始版通常只有一排基本操作按鈕
  // - 重構版需要把「操作按鈕 + 出牌區 + 棄牌區」整合到同一個操作面板中
  // - 這樣玩家在同一區域就能理解:
  //   現在能做什麼、目前是哪個 window、需不需要棄牌

  return (
    // TODO:
    // 你需要在這裡完成整個 OperatePanel 的 JSX 結構。
    //
    // 建議依照以下步驟實作:

    // --------------------------------------------------
    // Step 1. 建立最外層 section
    // --------------------------------------------------
    // - 使用 <section> 作為語意化容器
    // - className 建議保留 "panel operate-panel"
    // - 這個 section 代表整個主操作面板區
    //
    // 在這個 section 中，建議至少包含三個主要區塊:
    // 1. 標題區（例如 <h2>Operate Panel</h2>）
    // 2. operate-actions：常駐操作按鈕列
    // 3. 條件式面板區：Play Card Panel / Discard Card Panel

    // --------------------------------------------------
    // Step 2. 建立常駐操作按鈕區 operate-actions
    // --------------------------------------------------
    // - 使用一個 <div className="operate-actions"> 包住所有主要操作按鈕
    // - 這些按鈕原則上任何 phase 都會顯示，但是否可點擊由 can.xxx 控制
    //
    // 你需要依序完成以下按鈕:

    // (A) ACTION:Skip
    // - 用途: 在 ACTION phase 中，讓 attacker 放棄出牌
    // - disabled 應綁定 !can.ACTION_SKIP
    // - 點擊時 dispatch:
    //   { type: "SKIP_CARD", player: attacker }
    //
    // 注意:
    // - 這不是「結束整回合」，只是跳過目前 ACTION 出牌 window
    // - SKIP_CARD 的 player 應是 attacker，因為 ACTION window 由 attacker 決定要不要出牌

    // (B) Roll
    // - 用途: 在 ROLL phase 由 attacker 擲骰
    // - disabled 應綁定 !can.ROLL_DICE
    // - 點擊時 dispatch:
    //   { type: "ROLL_DICE", player: attacker }
    //
    // 注意:
    // - 雖然畫面上是任何時候都看到 Roll 按鈕，但只有 can.ROLL_DICE 為 true 時才能操作
    // - player 應與目前攻擊方一致

    // (C) REACTION:Skip
    // - 用途: 在 REACTION phase 中，讓 defender 放棄出牌
    // - disabled 應綁定 !can.REACTION_SKIP
    // - 點擊時 dispatch:
    //   { type: "SKIP_CARD", player: defender }
    //
    // 注意:
    // - 與 ACTION:Skip 同樣都是 SKIP_CARD
    // - 差別在這裡跳過的是 defender 的 REACTION window

    // (D) Resolve
    // - 用途: 進入 / 觸發 RESOLVE_ROLL，讓本回合攻防與卡牌效果真正結算
    // - disabled 應綁定 !can.RESOLVE_ROLL
    // - 點擊時 dispatch:
    //   { type: "RESOLVE_ROLL" }
    //
    // 注意:
    // - 此 action 通常不需要 player payload
    // - 但最終仍應以 shared engine 的 action type 定義為準

    // (E) Draw
    // - 用途: 進入抽牌流程
    // - disabled 應綁定 !can.DRAW_CARD
    // - 點擊時 dispatch:
    //   { type: "DRAW_CARD" }
    //
    // 注意:
    // - 若 draw 後手牌變成 6 張，上層 state / reducer 應會讓 needDiscard 變成 true
    // - OperatePanel 自己不負責決定抽牌是否合法，只根據 can.DRAW_CARD 呈現能否操作

    // (F) End
    // - 用途: 結束回合
    // - disabled 應綁定 !can.END_TURN
    // - 點擊時 dispatch:
    //   { type: "END_TURN", player: attacker }
    //
    // 注意:
    // - 這裡是否需要 player，必須與 shared action type 對齊
    // - 若 shared reducer 的 END_TURN 不需要 player，就不能硬加
    // - ***先回頭確認 type 定義再實作***

    // (G) Reset
    // - 用途: 將整場遊戲重置回初始狀態
    // - disabled 應綁定 !can.RESET
    // - 點擊時 dispatch:
    //   { type: "RESET" }

    // --------------------------------------------------
    // Step 3. 建立 Play Card Panel 區塊標題與規則提示
    // --------------------------------------------------
    // - 在按鈕列下方加入 Play Card Panel 的區塊標題，例如 <h3>Play Card Panel</h3>
    // - 再加入一段提示文字（hint），說明出牌規則
    //
    // 提示內容重點:
    // - 每位玩家每回合最多出 1 張牌
    // - ACTION window 只能 attacker 出牌
    // - REACTION window 只能 defender 出牌
    //
    // 這段提示的目的:
    // - 讓玩家理解為什麼某些 phase 沒有卡牌區，或某些人不能操作
    // - 降低 UI 行為與規則不一致時的困惑

    // --------------------------------------------------
    // Step 4. 建立 play-card-slot 容器
    // --------------------------------------------------
    // - 使用 <div className="play-card-slot"> 作為 Play Card Panel 的內容容器
    // - 這裡要依據 state.phase 做條件渲染
    //
    // 你需要分三種情況處理:

    // Case A. state.phase === "ACTION"
    // - 顯示 attacker 的出牌區
    // - 可以使用一個 <div className="play-card-box"> 包起來
    // - 內部建議有標題，例如 <h2>Attacker Play Card</h2>
    // - 再渲染:
    //   <CardButtons
    //      disabled={!canPlayInAction}
    //      player={attacker}
    //      hand={handAttacker}
    //      dispatch={dispatch}
    //   />
    //
    // 核心概念:
    // - ACTION phase 只有 attacker 可以打牌
    // - hand 應給 attacker 的手牌
    // - disabled 不是永遠 false，而是由 canPlayInAction 決定

    // Case B. state.phase === "REACTION"
    // - 顯示 defender 的出牌區
    // - 一樣放在 <div className="play-card-box"> 中
    // - 標題可為 <h2>Defender Play Card</h2>
    // - 再渲染:
    //   <CardButtons
    //      disabled={!canPlayInReaction}
    //      player={defender}
    //      hand={handDefender}
    //      dispatch={dispatch}
    //   />
    //
    // 核心概念:
    // - REACTION phase 只有 defender 可以打牌
    // - hand 應改成 defender 的手牌

    // Case C. 其他 phase
    // - 若 phase 不是 ACTION 也不是 REACTION，顯示 idle 訊息
    // - 例如:
    //   <div className="play-card-box idle">No card play in this phase.</div>
    //
    // 目的:
    // - 讓玩家知道「現在不是漏渲染，而是目前 phase 本來就沒有出牌 window」
    // - 這個 idle box 有助於畫面結構穩定，不會因沒有內容而突然塌陷

    // --------------------------------------------------
    // Step 5. 依 needDiscard 條件渲染 Discard Card Panel
    // --------------------------------------------------
    // - 如果 needDiscard === true，必須額外顯示棄牌區
    // - 這塊建議放在 Play Card Panel 下方
    // - 用一個 <div className="discard-slot"> 包住整個棄牌面板
    //
    // 此區塊建議包含:
    // 1. 標題，例如 <h3>Discard Card Panel</h3>
    // 2. 說明文字（hint）
    // 3. 實際的棄牌按鈕列表

    // --------------------------------------------------
    // Step 6. 建立 discard 說明文字
    // --------------------------------------------------
    // - 提示目前是因為 DRAW phase 且 currentPlayer 有 6 張牌
    // - 必須先棄到 5 張，才能繼續結束流程
    //
    // 提示內容重點:
    // - why: 為什麼要棄牌
    // - when: 發生在什麼狀況（通常是 draw 後超手牌上限）
    // - what next: 必須先棄牌，之後才能繼續

    // --------------------------------------------------
    // Step 7. 建立 discard-actions 按鈕列表
    // --------------------------------------------------
    // - 使用 <div className="discard-actions"> 包住所有棄牌按鈕
    // - 走訪當前 currentPlayer 的手牌:
    //   state.players[state.currentPlayer].hand.map(...)
    //
    // 每張牌都要渲染成一個棄牌按鈕:
    // - key 可使用 `${c}-${i}`
    // - className 建議為 "discard-btn"
    // - 按鈕文字可為 `Discard ${c}`

    // --------------------------------------------------
    // Step 8. 完成每個 discard button 的 click 行為
    // --------------------------------------------------
    // - 點擊某張牌時，應 dispatch 一個 DISCARD_CARD action
    // - payload 結構:
    //   {
    //     type: "DISCARD_CARD",
    //     player: state.currentPlayer,
    //     cardId: c
    //   }
    //
    // 注意:
    // - player 不是 attacker / defender，而是 state.currentPlayer
    // - 因為 needDiscard 的責任對象是「目前需要棄牌的人」
    // - 這通常發生在 DRAW 後，所以要以 currentPlayer 為準，而不是固定攻守角色

    // --------------------------------------------------
    // Step 9. 元件責任邊界整理
    // --------------------------------------------------
    // OperatePanel 負責:
    // - 顯示主操作按鈕
    // - 根據 phase 顯示適合的 Play Card Panel
    // - 在 needDiscard 時顯示 Discard Card Panel
    // - 把使用者操作轉成正確的 dispatch
    //
    // OperatePanel 不負責:
    // - 自己計算哪些按鈕能不能按（這是 can props 的責任）
    // - 驗證 action 合法性（這是 reducer / shared engine 的責任）
    // - 決定 attacker / defender 誰是誰（這通常由上層先算好再傳入）

    // --------------------------------------------------
    // Step 10. UI/UX 補充思考（可選）
    // --------------------------------------------------
    // - 常駐操作區與條件式面板應有明確視覺分層
    // - Play Card Panel 與 Discard Card Panel 最好不要互相混在一起
    // - idle 狀態要有固定高度或明確容器，避免畫面因 phase 改變而大幅跳動
    // - 若 needDiscard 為 true，視規則可考慮讓 End button disabled（但這邏輯通常由 can.END_TURN 控制）

    // TODO: 請依上述步驟自行完成 JSX 與事件處理
    <></>
  );
}

type GalleryProps = {
  p1Color: string;
  p2Color: string;
  p1Level: number;
  p2Level: number;
  maxLevel?: number;
  width?: number;
  height?: number;
};

function Gallery({
  p1Color,
  p2Color,
  p1Level,
  p2Level,
  maxLevel = 120,
  width = 600,
  height = 600,
}: GalleryProps) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---------- Helpers ----------
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const levelToY = (level: number) => {

      const padTop = 60;
      const padBottom = 60;
      const usableH = height - padTop - padBottom;
      const t = clamp(level, 0, maxLevel) / maxLevel;
      return padTop + (1 - t) * usableH;
    };

    // ---------- Clear ----------
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const cliffW = Math.max(90, width * 0.22);
    const cliffH = Math.max(280, height * 0.68);
    const cliffX = (width - cliffW) / 2;
    const cliffY = (height - cliffH) / 2;
    const wallX = cliffX + cliffW * 0.72;

    const jag = (amp: number) => (Math.random() * 2 - 1) * amp;

    const topY = cliffY;
    const botY = cliffY + cliffH;

    const p0 = { x: wallX, y: topY + 8 };
    const p1 = { x: cliffX + cliffW * 0.15 + jag(10), y: topY + cliffH * 0.08 };
    const p2 = { x: cliffX + cliffW * 0.05 + jag(12), y: topY + cliffH * 0.30 };
    const p3 = { x: cliffX + cliffW * 0.18 + jag(12), y: topY + cliffH * 0.55 };
    const p4 = { x: cliffX + cliffW * 0.08 + jag(10), y: topY + cliffH * 0.82 };
    const p5 = { x: wallX, y: botY - 8 };

    const rockGrad = ctx.createLinearGradient(cliffX, 0, wallX, 0);
    rockGrad.addColorStop(0, "#8f949b");
    rockGrad.addColorStop(1, "#6f7680");
    ctx.fillStyle = rockGrad;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wallX, topY + 10);
    ctx.lineTo(wallX, botY - 10);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(17,24,39,0.25)";
    for (let i = 0; i < 6; i++) {
      const y = topY + (i + 1) * (cliffH / 7) + jag(6);
      const x1 = cliffX + cliffW * 0.18 + jag(8);
      const x2 = wallX - 6 + jag(6);

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y + jag(8));
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 5; i++) {
      const y = topY + cliffH * (0.15 + i * 0.16) + jag(6);
      const w = 10 + Math.random() * 14;
      const h = 3 + Math.random() * 4;
      ctx.fillRect(wallX - w - 4, y, w, h);
    }

    // ---------- P1 ----------
    const p1X = width * 0.22;
    const p1Y = levelToY(p1Level);
    const r = 18;

    ctx.beginPath();
    ctx.fillStyle = p1Color || "red";
    ctx.arc(p1X, p1Y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p1Color || "red";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P1", p1X, p1Y - r - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p1Level}`, p1X, p1Y + r + 8);

    // ---------- P2 ----------
    const p2X = width * 0.78;
    const p2Y = levelToY(p2Level);

    ctx.beginPath();
    ctx.fillStyle = p2Color || "blue";
    ctx.arc(p2X, p2Y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p2Color || "blue";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("P2", p2X, p2Y - r - 8);

    ctx.font = "14px Arial";
    ctx.textBaseline = "top";
    ctx.fillText(`Lv ${p2Level}`, p2X, p2Y + r + 8);

    // ---------- Scale ----------
    const scaleX = width - 60;
    const scaleTop = 60;
    const scaleBottom = height - 60;

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleTop);
    ctx.lineTo(scaleX, scaleBottom);
    ctx.stroke();

    const tickCount = 6;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= tickCount; i++) {
      const t = i / tickCount;
      const y = scaleTop + t * (scaleBottom - scaleTop);
      const level = Math.round(maxLevel * (1 - t));

      ctx.beginPath();
      ctx.moveTo(scaleX - 8, y);
      ctx.lineTo(scaleX + 8, y);
      ctx.stroke();

      if (i % 2 === 0) ctx.fillText(String(level), scaleX + 14, y);
    }

    ctx.font = "13px Arial";
    ctx.fillText(String(maxLevel), scaleX + 14, scaleTop);
    ctx.fillText("0", scaleX + 14, scaleBottom);

    const p1ScaleY = levelToY(p1Level);
    const p2ScaleY = levelToY(p2Level);

    ctx.lineWidth = 3;

    ctx.strokeStyle = p1Color || "red";
    ctx.beginPath();
    ctx.moveTo(scaleX - 14, p1ScaleY);
    ctx.lineTo(scaleX + 14, p1ScaleY);
    ctx.stroke();
    ctx.fillStyle = p1Color || "red";
    ctx.fillText("P1", scaleX - 40, p1ScaleY);

    ctx.strokeStyle = p2Color || "blue";
    ctx.beginPath();
    ctx.moveTo(scaleX - 14, p2ScaleY);
    ctx.lineTo(scaleX + 14, p2ScaleY);
    ctx.stroke();
    ctx.fillStyle = p2Color || "blue";
    ctx.fillText("P2", scaleX - 40, p2ScaleY);
  }, [p1Color, p2Color, p1Level, p2Level, maxLevel, width, height]);

  return (
    <div className="gallery-panel panel">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

function clampInt(x: number, lo: number, hi: number): number {
  // Args:
  // - x: 原始輸入值
  // - lo: 下界
  // - hi: 上界
  //
  // 用途:
  // - 將輸入安全限制在整數區間內。
  // - 主要給 SET_ROLL 的 0..6 輸入使用。
  //
  // 新增原因:
  // - 原始版缺少可重用的整數夾取工具。
  // - 與其把同樣的檢查邏輯寫在 onChange / onClick 中，抽成純函式更好測試。
  //
  // 實作步驟:
  // 1. 若 x 非有限數，回傳 lo。
  // 2. 若 x < lo，回傳 lo。
  // 3. 若 x > hi，回傳 hi。
  // 4. 否則回傳 Math.floor(x)。
  // TODO

}
