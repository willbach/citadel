/-  *citadel
/+  *citadel, default-agent, verb, dbug,
    auto=language-server-complete, shoe, sole
::
|%
+$  card  card:shoe
::
+$  versioned-state
  $%  state-0
  ==
::
+$  state-0
  $:  audience=(set target)                         ::  active targets
      width=@ud                                     ::  display width
      eny=@uvJ                                      ::  entropy
  ==
::
+$  target  [in-group=? =ship =path]
::
+$  command
  $%
      [%help ~]                                     ::  print usage info
      [%desk @tas [%from (unit @tas)] [%diagram (unit @tas)]]          ::  create a new desk
      [%settings ~]
  ==
::
--
=|  state-0
=*  state  -
::
%-  agent:dbug
%+  verb  |
^-  agent:gall
%-  (agent:shoe command)
^-  (shoe:shoe command)
=<
  |_  =bowl:gall
  +*  this       .
      citadel-core  +>
      cc         ~(. citadel-core(eny eny.bowl) bowl)
      def        ~(. (default-agent this %|) bowl)
      des        ~(. (default:shoe this command) bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  (prep:cc ~)
    [cards this]
  ::
  ++  on-save  !>(state)
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    =^  cards  state  (prep:cc `old)
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
      ?+  mark        (on-poke:def mark vase)
        %noun         (poke-noun:cc !<(* vase))
      ==
    [cards this]
  ::
  ++  on-watch  on-watch:def
  ++  on-leave  on-leave:def
  ++  on-peek   on-peek:def
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state
      ?-    -.sign
        %poke-ack   [- state]:(on-agent:def wire sign)
        %watch-ack  [- state]:(on-agent:def wire sign)
      ::
          %kick
        :_  state
        ?+  wire  ~
          [%citadel ~]  ~[connect:cc]
        ==
      ::
          %fact
        ?+  p.cage.sign  ~|([%citadel-cli-bad-sub-mark wire p.cage.sign] !!)
            %citadel-delta
          ~|([%citadel-cli-bad-sub-mark wire p.cage.sign] !!)
        ==
      ==
    [cards this]
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  ++  command-parser
    |=  sole-id=@ta
    parser:sh:cc
  ::
  ++  tab-list
    |=  sole-id=@ta
    %+  turn  tab-list:sh:cc
    |=  [term=cord detail=tank]
    [(cat 3 ';' term) detail]
  ::
  ++  on-command
    |=  [sole-id=@ta =command]
    =^  cards  state
      (work:sh:cc command)
    [cards this]
  ::
  ++  on-connect
    |=  sole-id=@ta
    ^-  (quip card _this)
    [[prompt:sh-out:cc ~] this]
  ::
  ++  can-connect     can-connect:des
  ++  on-disconnect   on-disconnect:des
  --
::
|_  =bowl:gall
::  +prep: setup & state adapter
::
++  prep
  |=  old=(unit versioned-state)
  ^-  (quip card _state)
  ?~  old
    =^  cards  state
      :-  ~[connect]
      %_  state
        audience  [[| our-self /citadel] ~ ~]
        width     80
      ==
    [cards state]
  [~ state(width 80, audience [[| our-self /citadel] ~ ~])]
::  +connect: connect to citadel
::
++  connect
  ^-  card
  [%pass /citadel %agent [our-self %citadel] %watch /citadel-primary]
::
++  our-self  our.bowl
::  +target-to-path: prepend ship to the path
::
++  target-to-path
  |=  target
  ^-  ^path
  %+  weld
    ?:(in-group ~ /~)
  [(scot %p ship) path]
::  +poke-noun: debug helpers
::
++  poke-noun
  |=  a=*
  ^-  (quip card _state)
  ?:  ?=(%connect a)
    [[connect ~] state]
  [~ state]
::
::  +sh: handle user input
::
++  sh
  |%
  ::  +parser: command parser
  ::
  ::    parses the command line buffer.
  ::    produces commands which can be executed by +work.
  ::
  ++  parser
    |^
      %+  stag  |
      %+  knee  *command  |.  ~+
      =-  ;~(pfix mic -)
      ;~  pose
        ;~(plug (tag %help) (easy ~))
        ;~  plug  (tag %desk)
          ;~(pfix ace sym)
          (stag %from ;~(pose (cold ~ ;~(pfix ace sig)) (punt ;~(pfix ace sym)) (cold [~ %base] (easy ~))))
          (stag %diagram ;~(pose (cold ~ ;~(pfix ace sig)) (punt ;~(pfix ace sym)) (cold ~ (easy ~))))
        ==
        ;~(plug (tag %settings) (easy ~))
      ==
    ::
    ++  tag   |*(a=@tas (cold a (jest a)))
    ++  bool
      ;~  pose
        (cold %| (jest '%.y'))
        (cold %& (jest '%.n'))
      ==
    ++  ship  ;~(pfix sig fed:ag)
    ++  path  ;~(pfix fas ;~(plug urs:ab (easy ~)))  ::NOTE  short only, tmp
    ++  file-path  ;~(pfix fas (more fas (cook crip (star ;~(less fas prn)))))
    ::  +mang: un/managed indicator prefix
    ::
    ++  mang
      ;~  pose
        (cold %| (jest '~/'))
        (cold %& (easy ~))
      ==
    ::  +tarl: local target, as /path
    ::
    ++  tarl  (stag our-self path)
    ::  +tarx: local target, maybe managed
    ::
    ++  tarx  ;~(plug mang path)
    ::  +tarp: sponsor target, as ^/path
    ::
    ++  tarp
      =-  ;~(pfix ket (stag - path))
      (sein:title our.bowl now.bowl our-self)
    ::  +targ: any target, as tarl, tarp, ~ship/path
    ::
    ++  targ
      ;~  plug
        mang
      ::
        ;~  pose
          tarl
          tarp
          ;~(plug ship path)
        ==
      ==
    ::  +tars: set of comma-separated targs
    ::
    ++  tars
      %+  cook  ~(gas in *(set target))
      (most ;~(plug com (star ace)) targ)
    ::  +ships: set of comma-separated ships
    ::
    ++  ships
      %+  cook  ~(gas in *(set ^ship))
      (most ;~(plug com (star ace)) ship)
    ::  +text: text message body
    ::
    ++  text
      %+  cook  crip
      (plus next)
  --
  ::  +tab-list: static list of autocomplete entries
  ::
  ++  tab-list
    ^-  (list [@t tank])
    :~
      [%help leaf+";help"]
      [%desk leaf+";desk [[desk-name] [from (optional)]  [diagram (optional)]"]
      [%settings leaf+";settings"]
    ==
  ::  +work: run user command
  ::
  ++  work
    |=  job=command
    ^-  (quip card _state)
    ~&  >  job+job
    |^  ?-  -.job
          %help      help
          %desk      (new-desk +.job)
          %settings  show-settings
        ==
    ::  +act: build action card
    ::
    ++  act
      |=  [what=term app=term =cage]
      ^-  card
      :*  %pass
          /cli-command/[what]
          %agent
          [our-self app]
          %poke
          cage
      ==
    ::  +set-target: set audience
    ::
    ++  set-target
      |=  tars=(set target)
      ^-  (quip card _state)
      =.  audience  tars
      [~ state]
    ::  +show-settings: print enabled flags, timezone and width settings
    ::
    ++  show-settings
      ^-  (quip card _state)
      :_  state
      =/  targets
        %+  turn  ~(tap in audience)
        |=  =target  ~&  target+target  ~
      :~  (print:sh-out "width: {(scow %ud width)}")
      ==
    ::
    ++  new-desk
      |=  [title=@tas [%from from=(unit @tas)] [%diagram gram=(unit @tas)]]
      ^-  (quip card _state)
      ?^  gram  (new-estate title (^gram title u.gram ~))
      =-  [[- ~] state]

      ~&  >  title+title
      %^  act  %desk  %citadel
      :-  %citadel-action
      !>  ^-  action
      [%desk ?~(from %base u.from) title]
      ::
    ++  new-estate
      |=  [title=@tas style=gram]
      ^-  (quip card _state)
      =-  [[- ~] state]
      ~&  >  from-diagrams+style
      %^  act  %diagram  %citadel
      :-  %citadel-action
      !>  ^-  action
      [%diagram [style title]]
    ::  +set-width: configure cli printing width
    ::
    ++  set-width
      |=  w=@ud
      [~ state(width w)]
    ::  +help: print (link to) usage instructions
    ::
    ++  help
      ^-  (quip card _state)
      =-  [[- ~] state]
      (print:sh-out "see https://github.com/ryjm/citadel")
    --
  --
::
::  +sh-out: output to the cli
::
++  sh-out
  |%
  ::  +effect: console effect card
  ::
  ++  effect
    |=  effect=sole-effect:sole
    ^-  card
    [%shoe ~ %sole effect]
  ::  +print: puts some text into the cli as-is
  ::
  ++  print
    |=  txt=tape
    ^-  card
    (effect %txt txt)
  ::  +print-more: puts lines of text into the cli
  ::
  ++  print-more
    |=  txs=(list tape)
    ^-  card
    %+  effect  %mor
    (turn txs |=(t=tape [%txt t]))
  ::  +note: prints left-padded ---| txt
  ::
  ++  note
    |=  txt=tape
    ^-  card
    =+  lis=(simple-wrap txt (sub width 16))
    %-  print-more
    =+  ?:((gth (lent lis) 0) (snag 0 lis) "")
    :-  (runt [14 '-'] '|' ' ' -)
    %+  turn  (slag 1 lis)
    |=(a=tape (runt [14 ' '] '|' ' ' a))
  ::  +prompt: update prompt to display current audience
  ::
  ++  prompt
    ^-  card
    %+  effect  %pro
    :+  &  %citadel-line
    ^-  tape
    ">"
  ::
  ++  show-result
    |=  =cage
    ^-  card
    =/  typ  p.cage
    =/  =vase  q.cage
    (note "result: {(noah vase)}")
  ::
  --
::
++  simple-wrap
  |=  [txt=tape wid=@ud]
  ^-  (list tape)
  ?~  txt  ~
  =/  [end=@ud nex=?]
    ?:  (lte (lent txt) wid)  [(lent txt) &]
    =+  ace=(find " " (flop (scag +(wid) `tape`txt)))
    ?~  ace  [wid |]
    [(sub wid u.ace) &]
  :-  (tufa (scag end `(list @)`txt))
  $(txt (slag ?:(nex +(end) end) `tape`txt))
::
++  scry-for
  |*  [=mold app=term =path]
  .^  mold
    %gx
    (scot %p our.bowl)
    app
    (scot %da now.bowl)
    (snoc `^path`path %noun)
  ==
--
