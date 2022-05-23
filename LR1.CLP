;;****************
;;* DEFFUNCTIONS *
;;****************

(deffunction ask-question (?question $?allowed-values)
   (printout t ?question)
   (bind ?answer (read))
   (if (lexemep ?answer) 
       then (bind ?answer (lowcase ?answer)))
   (while (not (member ?answer ?allowed-values)) do
      (printout t ?question)
      (bind ?answer (read))
      (if (lexemep ?answer) 
          then (bind ?answer (lowcase ?answer))))
   ?answer)

(deffunction yes-or-no-p (?question)
   (bind ?response (ask-question ?question yes no y n))
   (if (or (eq ?response yes) (eq ?response y))
       then yes 
       else no))

;;;***************
;;;* QUERY RULES *
;;;***************

(defrule determine-inet-works ""
   (not (inet-works ?))
   (not (repair ?))
   =>
   (assert (inet-works (yes-or-no-p "Does the internet work (yes/no)? "))))
 
(defrule determine-ping-8.8.8.8 ""
   (inet-works no)
   (not (repair ?))
   =>
   (assert (ping-8.8.8.8
      (ask-question "Can you sucessfully ping 8.8.8.8 (yes/no/with_losses)? "
                    yes no with_losses))))

(defrule determine-nic-link ""
   (inet-works no)
   (ping-8.8.8.8 no)
   (not (repair ?))
   =>
   (assert (nic-link (yes-or-no-p "Does the link indicator on your NIC light (yes/no)? "))))
   
(defrule determine-cable-state ""
   (inet-works no)
   (ping-8.8.8.8 no)
   (not (repair ?))
   (nic-link no)
   =>
   (assert (cable-state-ok (yes-or-no-p "Is the cable OK (yes/no)? "))))
   
(defrule determine-rj45-state ""
   (inet-works no)
   (ping-8.8.8.8 no)
   (not (repair ?))
   (nic-link no)
   =>
   (assert (rj45-state-ok (yes-or-no-p "Is the RJ45 connector OK (yes/no)? "))))

(defrule determine-net-settings ""
   (inet-works no)
   (ping-8.8.8.8 no)
   (not (repair ?))
   (nic-link yes)
   =>
   (assert (net-settings-ok (yes-or-no-p "Do PC network settings match the values from information list (yes/no)? "))))

(defrule determine-ping-ya.ru ""
   (inet-works no)
   (ping-8.8.8.8 yes)
   (not (repair ?))
   =>
   (assert (ping-ya.ru (yes-or-no-p "Can you sucessfully ping ya.ru (yes/no)? "))))

(defrule determine-dns-settings ""
   (inet-works no)
   (ping-8.8.8.8 yes)
   (ping-ya.ru no)
   (not (repair ?))
   =>
   (assert (dns-settings-ok (yes-or-no-p "Are PC DNS settings correct (yes/no)? "))))

(defrule determine-slow-web ""
   (inet-works yes)
   (not (repair ?))
   =>
   (assert (slow-web (yes-or-no-p "Do internet pages open slowly (yes/no)? "))))

(defrule determine-slow-speed ""
   (inet-works yes)
   (slow-web yes)
   (not (repair ?))
   =>
   (assert (slow-speed (yes-or-no-p "Please measure your internet speed. Is it much slower than is specified by your tariff (yes/no)? "))))

(defrule determine-losses ""
   (inet-works yes)
   (slow-web yes)
   (slow-speed yes)
   (not (repair ?))
   =>
   (assert (losses-present (yes-or-no-p "Please ping 8.8.8.8. Do you have losses in transmission (yes/no)? "))))
   
   
;;;****************
;;;* REPAIR RULES *
;;;****************

(defrule rj45-problem ""
   (rj45-state-ok no)
   (not (repair ?))
   =>
   (assert (repair "You need to replace RJ45 connector on your cable")))

(defrule cable-problem ""
   (cable-state-ok no)
   (not (repair ?))
   =>
   (assert (repair "You need to replace your network cable")))

(defrule pc-settings-problem ""
   (net-settings-ok no)
   (not (repair ?))
   =>
   (assert (repair "You need to change your PC network settings according to information list")))

(defrule isp-problem ""
   (dns-settings-ok yes)
   (not (repair ?))
   =>
   (assert (repair "There is a problem on the ISP side")))
   
(defrule pc-dns-problem ""
   (dns-settings-ok no)
   (not (repair ?))
   =>
   (assert (repair "You need to change your PC DNS settings according to information list")))

(defrule no-problem ""
   (slow-web no)
   (not (repair ?))
   =>
   (assert (repair "Your Internet connection is fine")))

(defrule pc-virus-problem ""
   (losses-present no)
   (not (repair ?))
   =>
   (assert (repair "There is a problem with your PC. Please, check your system with an antivirus and disable any other software that may consume Internet bandwidth")))

(defrule browser-problem ""
   (or (slow-speed no)
   (ping-ya.ru yes))
   (not (repair ?))
   =>
   (assert (repair "There is a problem with your browser. Please reinstall it or try another one")))

(defrule last-mile-problem ""
   (or (and (cable-state-ok yes) (rj45-state-ok yes))
   (net-settings-ok yes)
   (ping-8.8.8.8 with_losses)
   (losses-present yes)
   )
   =>
   (assert (repair "There is a problem on a last mile. You need to call a technician to determine exact point of failure and fix it")))

   
;;;********************************
;;;* STARTUP AND CONCLUSION RULES *
;;;********************************

(defrule system-banner ""
  (declare (salience 10))
  =>
  (printout t crlf crlf)
  (printout t "The Internet Diagnostics Expert System")
  (printout t crlf crlf))

(defrule print-repair ""
  (declare (salience 10))
  (repair ?item)
  =>
  (printout t crlf crlf)
  (printout t "Suggested Repair:")
  (printout t crlf crlf)
  (format t " %s%n%n%n" ?item))
