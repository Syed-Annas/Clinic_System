import { useEffect, useState, useMemo, useCallback } from "react"
import { useSupabaseStorage } from "./useSupabaseStorage"
import "./App.css"

function getBrowserSessionId() {
  const storageKey = "cs_browser_session_id"
  try {
    const existing = localStorage.getItem(storageKey)
    if (existing) return existing
    const generated = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(storageKey, generated)
    return generated
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function getStoredAuthSession() {
  try {
    const stored = localStorage.getItem("cs_auth_session")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function setStoredAuthSession(user) {
  try {
    localStorage.setItem("cs_auth_session", JSON.stringify(user))
  } catch (err) {
    console.error("Could not persist login session.", err)
  }
}

function clearStoredAuthSession() {
  try {
    localStorage.removeItem("cs_auth_session")
  } catch (err) {
    console.error("Could not clear login session.", err)
  }
}

function App() {
  // ============================================================
  // CLINIC
  // ============================================================

  const clinicId = "SA1"
  const currentYear = new Date().getFullYear().toString().slice(-2)

  const [clinic, setClinic] = useSupabaseStorage("clinic", {
    clinicId: "SA1",
    name: "Sarte Aesthetic Clinic",
    phone: "",
    address: "",
    openingTime: "13:30",
    closingTime: "21:00",
  })

  // ============================================================
  // LOGIN & AUTH
  // ============================================================

  const [currentUser, setCurrentUser] = useState(getStoredAuthSession)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredAuthSession()))
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [browserSessionId] = useState(getBrowserSessionId)
  const [showProfile, setShowProfile] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("")
  const [profileNewPassword, setProfileNewPassword] = useState("")
  const [profileMessage, setProfileMessage] = useState("")

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeSection, setActiveSection] = useState("Appointments")

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================

  function todaySafe() {
    return new Date().toLocaleDateString("en-CA")
  }

  const [dashboardPeriod, setDashboardPeriod] = useState("Today")
  const [dashboardFromDate, setDashboardFromDate] = useState(() => todaySafe())
  const [dashboardToDate, setDashboardToDate] = useState(() => todaySafe())
  const [dashboardDrilldown, setDashboardDrilldown] = useState(null)
  const [incentiveRate, setIncentiveRate] = useState(5) // 5% default incentive

  // ============================================================
  // ACTIVE STAFF & ON DUTY
  // ============================================================

  const [activeStaff, setActiveStaff] = useSupabaseStorage("activeStaff", [])
  const [staffWorkLogs, setStaffWorkLogs] = useSupabaseStorage("staffWorkLogs", [])

  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentUser.role === "Admin") return

    setActiveStaff((current) => {
      if (current.some((member) => member.sessionId === currentUser.sessionId)) return current
      const now = Date.now()
      return [
        ...current,
        {
          clinicId,
          userId: currentUser.userId,
          name: currentUser.name,
          role: currentUser.role,
          sessionId: currentUser.sessionId,
          loggedInAt: now,
          activeSince: now,
        },
      ]
    })
  }, [currentUser, isLoggedIn, setActiveStaff])

  // ============================================================
  // STAFF MANAGEMENT
  // ============================================================

  const [staff, setStaff] = useSupabaseStorage("staff", [])
  const [nextStaffNumber, setNextStaffNumber] = useSupabaseStorage("nextStaffNumber", 1)
  const [adminProfile, setAdminProfile] = useSupabaseStorage("adminProfile", {
    clinicId: "SA1",
    userId: "ADMIN",
    username: "admin",
    name: "Administrator",
    password: "admin123",
    role: "Admin",
  })

  const [showStaffForm, setShowStaffForm] = useState(false)
  const [staffName, setStaffName] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const [staffRole, setStaffRole] = useState("Operator")
  const [staffStatus, setStaffStatus] = useState("Active")
  const [editingStaffIndex, setEditingStaffIndex] = useState(null)

  // ============================================================
  // THERAPIST AVAILABILITY
  // ============================================================

  const [therapistAvailability, setTherapistAvailability] = useSupabaseStorage("therapistAvailability", [])

  // ============================================================
  // TREATMENTS
  // ============================================================

  const [treatments, setTreatments] = useSupabaseStorage("treatments", [
    { clinicId: "SA1", treatmentId: "TR001", name: "Hydra Facial", duration: 45, sessions: 1, price: 0, status: "Active" },
    { clinicId: "SA1", treatmentId: "TR002", name: "Chemical Peel", duration: 20, sessions: 1, price: 0, status: "Active" },
    { clinicId: "SA1", treatmentId: "TR003", name: "Laser Hair Removal", duration: 30, sessions: 1, price: 0, status: "Active" },
    { clinicId: "SA1", treatmentId: "TR004", name: "Skin Consultation", duration: 30, sessions: 1, price: 0, status: "Active" },
  ])

  const [nextTreatmentNumber, setNextTreatmentNumber] = useSupabaseStorage("nextTreatmentNumber", 5)
  const [treatmentHistory, setTreatmentHistory] = useSupabaseStorage("treatmentHistory", [])

  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [treatmentName, setTreatmentName] = useState("")
  const [treatmentDuration, setTreatmentDuration] = useState("")
  const [treatmentSessions, setTreatmentSessions] = useState(1)
  const [treatmentPrice, setTreatmentPrice] = useState("")
  const [treatmentStatus, setTreatmentStatus] = useState("Active")
  const [editingTreatmentIndex, setEditingTreatmentIndex] = useState(null)

  // ============================================================
  // ROOMS
  // ============================================================

  const [rooms, setRooms] = useSupabaseStorage("rooms", [
    { clinicId: "SA1", roomId: "RM001", name: "Room 1", status: "Active" },
    { clinicId: "SA1", roomId: "RM002", name: "Room 2", status: "Active" },
    { clinicId: "SA1", roomId: "RM003", name: "Room 3", status: "Active" },
  ])

  const [showRoomForm, setShowRoomForm] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [roomStatus, setRoomStatus] = useState("Active")
  const [editingRoomId, setEditingRoomId] = useState(null)

  // ============================================================
  // CLINIC FORM
  // ============================================================

  const [showClinicForm, setShowClinicForm] = useState(false)
  const [clinicName, setClinicName] = useState("")
  const [clinicPhone, setClinicPhone] = useState("")
  const [clinicAddress, setClinicAddress] = useState("")
  const [clinicOpeningTime, setClinicOpeningTime] = useState("")
  const [clinicClosingTime, setClinicClosingTime] = useState("")
  const [clinicSettingsTab, setClinicSettingsTab] = useState("Staff")

  // ============================================================
  // APPOINTMENTS & HISTORY
  // ============================================================

  const [appointments, setAppointments] = useSupabaseStorage("appointments", [])
  const [appointmentHistory, setAppointmentHistory] = useSupabaseStorage("appointmentHistory", [])
  const [appointmentActivities, setAppointmentActivities] = useSupabaseStorage("appointmentActivities", [])
  const [paymentRecords, setPaymentRecords] = useSupabaseStorage("paymentRecords", [])

  useEffect(() => {
    const cleanedHistory = appointmentHistory.filter(
      (item) => item.status !== "Deleted" && item.historyStatus !== "Deleted"
    )
    if (cleanedHistory.length !== appointmentHistory.length) {
      setAppointmentHistory(cleanedHistory)
    }
  }, [appointmentHistory, setAppointmentHistory])

  const logAppointmentActivity = (appointment, action, details = {}) => {
    const activity = {
      activityId: `ACT${Date.now()}${Math.floor(Math.random() * 1000)}`,
      clinicId: appointment.clinicId || clinicId,
      appointmentId: appointment.appointmentId || "",
      receiptId: appointment.receiptId || "",
      action,
      performedBy: {
        clinicId,
        userId: currentUser?.userId || username || "SYSTEM",
        name: currentUser?.name || username || "System",
      },
      timestamp: Date.now(),
      details,
    }
    setAppointmentActivities((current) => [...current, activity])
  }

  // ============================================================
  // RECEIPTS
  // ============================================================

  const [nextReceiptNumber, setNextReceiptNumber] = useSupabaseStorage(`nextReceiptNumber_${clinicId}_${currentYear}`, 1)

  // ============================================================
  // APPOINTMENT FORM MODAL STATE
  // ============================================================

  const [showForm, setShowForm] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [appointmentDate, setAppointmentDate] = useState(() => todaySafe())
  const [appointmentTime, setAppointmentTime] = useState("")
  const [treatment, setTreatment] = useState("")
  const [appointmentSessions, setAppointmentSessions] = useState(1)
  const [appointmentPrice, setAppointmentPrice] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingHistoryIndex, setEditingHistoryIndex] = useState(null)
  const [packagePriceLocked, setPackagePriceLocked] = useState(false)
  const [paidAmountLocked, setPaidAmountLocked] = useState(false)

  // ============================================================
  // TREATMENT ASSIGNMENT MODAL / DROPDOWN
  // ============================================================

  const [assigningAppointmentIndex, setAssigningAppointmentIndex] = useState(null)
  const [assignedRoom, setAssignedRoom] = useState("")
  const [assignedTherapist, setAssignedTherapist] = useState("")
  const [treatmentAssignments, setTreatmentAssignments] = useSupabaseStorage("treatmentAssignments", [])

  // ============================================================
  // DATE & SEARCH & INSPECTOR (Option 2 Split-View)
  // ============================================================

  const today = todaySafe()
  const [selectedDate, setSelectedDate] = useState(() => todaySafe())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState(0)
  const [selectedAppointmentKey, setSelectedAppointmentKey] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getTreatment = (treatmentNameValue) => {
    return treatments.find(
      (item) => item.clinicId === clinicId && item.name === treatmentNameValue && item.status === "Active"
    )
  }

  const getTreatmentDuration = (treatmentNameValue) => {
    const selectedTreatment = getTreatment(treatmentNameValue)
    return selectedTreatment ? Number(selectedTreatment.duration) : 0
  }

  const getTreatmentSessions = (treatmentNameValue) => {
    const selectedTreatment = getTreatment(treatmentNameValue)
    return selectedTreatment ? Number(selectedTreatment.sessions) || 1 : 1
  }

  const getTreatmentPrice = (treatmentNameValue) => {
    const selectedTreatment = getTreatment(treatmentNameValue)
    return selectedTreatment ? Number(selectedTreatment.price) || 0 : 0
  }

  const getRemainingSessions = (appointment) => {
    const totalSessions = Number(appointment?.sessions) || 1
    const sessionsUsed = appointment?.sessionsUsed === undefined
      ? (appointment?.historyStatus === "Completed" || appointment?.status === "Completed" ? 1 : 0)
      : Number(appointment.sessionsUsed) || 0
    return Math.max(0, Number(appointment?.remainingSessions ?? totalSessions - sessionsUsed))
  }

  const calculateBalance = (price, paid) => {
    return Math.max(0, Number(price || 0) - Number(paid || 0))
  }

  const getAvailableTherapists = () => {
    return staff.filter((member) => {
      if (member.clinicId !== clinicId || member.role !== "Therapist" || member.status !== "Active") {
        return false
      }
      const loggedIn = activeStaff.some((active) => active.userId === member.userId)
      if (!loggedIn) return false
      const alreadyTreating = appointments.some(
        (appointment) => appointment.therapist === member.userId && appointment.status === "In Treatment"
      )
      return !alreadyTreating
    })
  }

  const findFirstAvailableTime = (date, duration = 30) => {
    if (!date) return ""
    const [openingHour, openingMinute] = (clinic.openingTime || "13:30").split(":").map(Number)
    const [closingHour, closingMinute] = (clinic.closingTime || "21:00").split(":").map(Number)

    const openingMinutes = openingHour * 60 + openingMinute
    const closingMinutes = closingHour * 60 + closingMinute

    const activeRooms = rooms.filter((room) => room.clinicId === clinicId && room.status === "Active")
    if (activeRooms.length === 0) return ""

    for (let totalMinutes = openingMinutes; totalMinutes < closingMinutes; totalMinutes += 15) {
      const appointmentEndMinutes = totalMinutes + Number(duration)
      if (appointmentEndMinutes > closingMinutes) continue

      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

      const start = new Date(`${date}T${time}:00`)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + Number(duration))

      const roomAvailable = activeRooms.some((room) => {
        return !appointments.some((appointment, appointmentIndex) => {
          if (editingIndex !== null && appointmentIndex === editingIndex) return false
          if (appointment.room !== room.roomId || appointment.appointmentDate !== date) return false
          if (appointment.status === "Cancelled" || appointment.status === "No Show") return false
          if (!appointment.appointmentTime || !appointment.endTime) return false

          const existingStart = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}:00`)
          const existingEnd = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00`)
          return existingStart < end && existingEnd > start
        })
      })

      if (roomAvailable) return time
    }
    return ""
  }

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return ""
    const start = new Date(`1970-01-01T${startTime}:00`)
    start.setMinutes(start.getMinutes() + Number(duration))
    return start.toTimeString().slice(0, 5)
  }

  const resetAppointmentForm = () => {
    setCustomerName("")
    setPhoneNumber("")
    setAppointmentDate(todaySafe())
    setAppointmentTime("")
    setTreatment("")
    setAppointmentSessions(1)
    setAppointmentPrice(0)
    setPaidAmount(0)
    setEditingIndex(null)
    setEditingHistoryIndex(null)
    setPackagePriceLocked(false)
    setPaidAmountLocked(false)
    setShowForm(false)
  }

  const resetStaffForm = () => {
    setStaffName("")
    setStaffPassword("")
    setStaffRole("Operator")
    setStaffStatus("Active")
    setEditingStaffIndex(null)
    setShowStaffForm(false)
  }

  const resetTreatmentForm = () => {
    setTreatmentName("")
    setTreatmentDuration("")
    setTreatmentSessions(1)
    setTreatmentPrice("")
    setTreatmentStatus("Active")
    setEditingTreatmentIndex(null)
    setShowTreatmentForm(false)
  }

  const resetRoomForm = () => {
    setRoomName("")
    setRoomStatus("Active")
    setEditingRoomId(null)
    setShowRoomForm(false)
  }

  // DEFAULT APPOINTMENT DATE IS TODAY
  const openNewAppointmentForm = () => {
    const todayDate = todaySafe()
    const firstTime = findFirstAvailableTime(todayDate, 30)
    setEditingIndex(null)
    setCustomerName("")
    setPhoneNumber("")
    setTreatment("")
    setAppointmentSessions(1)
    setAppointmentPrice(0)
    setPaidAmount(0)
    setAppointmentDate(todayDate)
    setAppointmentTime(firstTime)
    setEditingHistoryIndex(null)
    setPackagePriceLocked(false)
    setPaidAmountLocked(false)
    setShowForm(true)
  }

  const openRescheduleForm = (appointment, index) => {
    setEditingIndex(index)
    setCustomerName(appointment.customerName || "")
    setPhoneNumber(appointment.phoneNumber || "")
    setAppointmentDate(appointment.appointmentDate || todaySafe())
    setAppointmentTime(appointment.appointmentTime || "")
    setTreatment(appointment.treatment || "")
    setAppointmentSessions(Number(appointment.sessions) || getTreatmentSessions(appointment.treatment))
    setAppointmentPrice(Number(appointment.packagePrice) || getTreatmentPrice(appointment.treatment))
    setPaidAmount(Number(appointment.paidAmount) || 0)
    setEditingHistoryIndex(null)
    setPackagePriceLocked(Number(appointment.sessionsUsed || 0) > 0)
    setPaidAmountLocked(
      Number(appointment.sessionsUsed || 0) > 0 &&
      calculateBalance(Number(appointment.packagePrice || 0), Number(appointment.paidAmount || 0)) <= 0
    )
    setShowForm(true)
  }

  const openFollowUpForm = (historyItem, historyIndex) => {
    const totalSessions = Number(historyItem.sessions) || 1
    const isUnattended = historyItem.historyStatus === "Cancelled" || historyItem.historyStatus === "No Show"
    const remainingSessions = isUnattended ? totalSessions : getRemainingSessions(historyItem)
    if (remainingSessions <= 0) return

    const followUpDate = todaySafe()
    setEditingIndex(null)
    setEditingHistoryIndex(historyIndex)
    setCustomerName(historyItem.customerName || "")
    setPhoneNumber(historyItem.phoneNumber || "")
    setAppointmentDate(followUpDate)
    setAppointmentTime(findFirstAvailableTime(followUpDate, Number(historyItem.duration) || 30))
    setTreatment(historyItem.treatment || "")
    setAppointmentSessions(totalSessions)
    setAppointmentPrice(Number(historyItem.packagePrice || historyItem.price || 0))
    setPaidAmount(Number(historyItem.paidAmount || 0))
    setPackagePriceLocked(true)
    setPaidAmountLocked(
      calculateBalance(Number(historyItem.packagePrice || historyItem.price || 0), Number(historyItem.paidAmount || 0)) <= 0
    )
    setShowForm(true)
  }

  // ============================================================
  // LOGIN / LOGOUT HANDLERS
  // ============================================================

  const handleLogin = () => {
    const staffMember = staff.find(
      (member) =>
        member.clinicId === clinicId &&
        member.userId === username &&
        member.password === password &&
        member.status === "Active"
    )

    // Ensure viewing today's appointments by default upon login
    setSelectedDate(todaySafe())

    if (username === adminProfile.username && password === adminProfile.password) {
      const adminUser = {
        clinicId,
        userId: "ADMIN",
        name: adminProfile.name,
        username: adminProfile.username,
        role: "Admin",
      }
      setCurrentUser(adminUser)
      setStoredAuthSession(adminUser)
      setIsLoggedIn(true)
      return
    }

    if (staffMember) {
      const loggedInUser = { ...staffMember, sessionId: browserSessionId }
      setCurrentUser(loggedInUser)
      setStoredAuthSession(loggedInUser)
      setIsLoggedIn(true)

      setActiveStaff((current) => {
        const alreadyActive = current.some((member) => member.sessionId === browserSessionId)
        if (alreadyActive) return current

        const now = Date.now()
        return [
          ...current,
          {
            clinicId,
            userId: staffMember.userId,
            name: staffMember.name,
            role: staffMember.role,
            sessionId: browserSessionId,
            loggedInAt: now,
            activeSince: now,
          },
        ]
      })
      return
    }

    alert("Invalid username or password.")
  }

  const openProfile = () => {
    setProfileName(currentUser?.name || "")
    setProfileCurrentPassword("")
    setProfileNewPassword("")
    setProfileMessage("")
    setShowProfile(true)
  }

  const handleProfileSave = (event) => {
    event.preventDefault()
    const staffIndex = staff.findIndex((member) => member.userId === currentUser?.userId)
    const existingPassword = currentUser?.role === "Admin"
      ? adminProfile.password
      : staff[staffIndex]?.password

    if (profileCurrentPassword !== existingPassword) {
      setProfileMessage("Current password is incorrect.")
      return
    }
    if (!profileName.trim() || !profileNewPassword.trim()) {
      setProfileMessage("Enter your name and a new password.")
      return
    }

    const updatedUser = { ...currentUser, name: profileName.trim() }
    if (currentUser.role === "Admin") {
      setAdminProfile({ ...adminProfile, name: profileName.trim(), password: profileNewPassword })
    } else if (staffIndex !== -1) {
      const updatedStaff = [...staff]
      updatedStaff[staffIndex] = { ...updatedStaff[staffIndex], name: profileName.trim(), password: profileNewPassword }
      setStaff(updatedStaff)
    }
    setCurrentUser(updatedUser)
    setStoredAuthSession(updatedUser)
    setProfileCurrentPassword("")
    setProfileNewPassword("")
    setProfileMessage("Profile updated successfully.")
  }

  const handleLogout = () => {
    if (currentUser && currentUser.role !== "Admin") {
      const activeEntry = activeStaff.find(
        (member) => member.sessionId === currentUser.sessionId
      )
      const loginTime = activeEntry?.loggedInAt || activeEntry?.activeSince || Date.now()
      const logoutTime = Date.now()
      const durationMs = Math.max(0, logoutTime - loginTime)
      const logDate = new Date(loginTime).toLocaleDateString("en-CA")

      setStaffWorkLogs((curr) => [
        ...curr,
        {
          clinicId,
          userId: currentUser.userId,
          name: currentUser.name,
          role: currentUser.role,
          date: logDate,
          loginTime,
          logoutTime,
          durationMs,
        },
      ])
      setActiveStaff((current) => current.filter((member) => member.sessionId !== currentUser.sessionId))
    }
    setCurrentUser(null)
    setIsLoggedIn(false)
    clearStoredAuthSession()
    setUsername("")
    setPassword("")
  }

  // ============================================================
  // DATE NAVIGATION FOR APPOINTMENTS TAB
  // ============================================================

  const handleShiftDate = (days) => {
    const d = new Date(selectedDate || todaySafe())
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toLocaleDateString("en-CA"))
  }

  // ============================================================
  // APPOINTMENT CRUD & BUSINESS LOGIC
  // ============================================================

  const handleBookingSubmit = (e) => {
    if (e) e.preventDefault()

    if (!customerName || !phoneNumber || !appointmentDate || !appointmentTime || !treatment) {
      alert("Please complete all appointment details.")
      return
    }

    const duration = getTreatmentDuration(treatment)
    const endTime = calculateEndTime(appointmentTime, duration)
    const numericPrice = Number(appointmentPrice || 0)
    const numericPaid = Number(paidAmount || 0)

    if (numericPrice < 0 || numericPaid < 0) {
      alert("Price and paid amount cannot be negative.")
      return
    }

    const activeRooms = rooms.filter((r) => r.clinicId === clinicId && r.status === "Active")
    const selectedStart = new Date(`${appointmentDate}T${appointmentTime}:00`)
    const selectedEnd = new Date(`${appointmentDate}T${endTime}:00`)

    const availableRoom = activeRooms.find((room) => {
      return !appointments.some((apt, idx) => {
        if (editingIndex !== null && idx === editingIndex) return false
        if (apt.room !== room.roomId || apt.appointmentDate !== appointmentDate) return false
        if (apt.status === "Cancelled" || apt.status === "No Show") return false
        if (!apt.appointmentTime || !apt.endTime) return false

        const existingStart = new Date(`${apt.appointmentDate}T${apt.appointmentTime}:00`)
        const existingEnd = new Date(`${apt.appointmentDate}T${apt.endTime}:00`)
        return existingStart < selectedEnd && existingEnd > selectedStart
      })
    })

    if (!availableRoom) {
      alert("All active treatment rooms are occupied at this time. Please select another slot.")
      return
    }

    if (editingHistoryIndex !== null) {
      const source = appointmentHistory[editingHistoryIndex]
      const totalSessions = Number(source?.sessions) || 1
      const sessionsUsed = Number(source?.sessionsUsed) || 0
      const remainingSessions = Number(source?.remainingSessions ?? totalSessions - sessionsUsed)
      if (!source || remainingSessions <= 0) {
        alert("All sessions in this package have already been used.")
        return
      }

      const followUpAppointment = {
        ...source,
        appointmentId: `APT${Date.now()}`,
        appointmentDate,
        appointmentTime,
        endTime,
        duration,
        status: "Booked",
        historyStatus: undefined,
        historyAt: undefined,
        sessions: totalSessions,
        sessionsUsed,
        remainingSessions,
        packageId: source.packageId || source.appointmentId,
        packagePrice: Number(source.packagePrice || source.price || 0),
        paidAmount: numericPaid,
        balance: calculateBalance(Number(source.packagePrice || source.price || 0), numericPaid),
        room: availableRoom.roomId,
        therapist: "",
        rebookedFromAppointmentId: source.appointmentId,
        rebookedBy: {
          clinicId,
          userId: currentUser?.userId || username,
          name: currentUser?.name || username,
        },
      }
      setAppointments((current) => [...current, followUpAppointment])
      const additionalPayment = Math.max(0, numericPaid - Number(source.paidAmount || 0))
      if (additionalPayment > 0) {
        setPaymentRecords((current) => [...current, {
          paymentId: `PAY${Date.now()}`,
          appointmentId: followUpAppointment.appointmentId,
          packageId: followUpAppointment.packageId,
          amount: additionalPayment,
          receivedDate: todaySafe(),
          receivedAt: Date.now(),
          receivedBy: followUpAppointment.bookedBy,
          treatment: followUpAppointment.treatment,
        }])
      }
      setAppointmentHistory((current) => current.map((item, index) => (
        index === editingHistoryIndex ? { ...item, followUpBooked: true } : item
      )))
      logAppointmentActivity(followUpAppointment, "Follow-up Session Booked")
      resetAppointmentForm()
      return
    }

    if (editingIndex !== null) {
      // RESCHEDULE / EDIT
      const previous = appointments[editingIndex]
      const updated = {
        ...previous,
        customerName,
        phoneNumber,
        appointmentDate,
        appointmentTime,
        endTime,
        duration,
        treatment,
        sessions: appointmentSessions,
        packagePrice: packagePriceLocked ? Number(previous.packagePrice || 0) : numericPrice,
        paidAmount: numericPaid,
        balance: calculateBalance(packagePriceLocked ? Number(previous.packagePrice || 0) : numericPrice, numericPaid),
        room: availableRoom.roomId,
        rescheduledBy: {
          clinicId,
          userId: currentUser?.userId || username,
          name: currentUser?.name || username,
        },
      }

      const nextAppointments = [...appointments]
      nextAppointments[editingIndex] = updated
      setAppointments(nextAppointments)
      const additionalPayment = Math.max(0, numericPaid - Number(previous.paidAmount || 0))
      if (additionalPayment > 0) {
        setPaymentRecords((current) => [...current, {
          paymentId: `PAY${Date.now()}`,
          appointmentId: updated.appointmentId,
          packageId: updated.packageId || updated.appointmentId,
          amount: additionalPayment,
          receivedDate: todaySafe(),
          receivedAt: Date.now(),
          receivedBy: updated.bookedBy,
          treatment: updated.treatment,
        }])
      }
      logAppointmentActivity(updated, "Rescheduled", { from: previous, to: updated })
      resetAppointmentForm()
      return
    }

    // NEW APPOINTMENT
    const paddedNum = String(nextReceiptNumber).padStart(3, "0")
    const generatedReceiptId = `${clinicId}${currentYear}${paddedNum}`
    const generatedAppointmentId = `APT${Date.now()}`

    const newAppointment = {
      clinicId,
      appointmentId: generatedAppointmentId,
      receiptId: generatedReceiptId,
      customerName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      endTime,
      duration,
      treatment,
      sessions: appointmentSessions,
      packagePrice: numericPrice,
      paidAmount: numericPaid,
      balance: calculateBalance(numericPrice, numericPaid),
      status: "Booked",
      room: availableRoom.roomId,
      therapist: "",
      createdAt: Date.now(),
      sessionsUsed: 0,
      remainingSessions: Number(appointmentSessions) || 1,
      packageId: generatedAppointmentId,
      bookedBy: {
        clinicId,
        userId: currentUser?.userId || username,
        name: currentUser?.name || username,
      },
    }

    setAppointments([...appointments, newAppointment])
    if (numericPaid > 0) {
      setPaymentRecords((current) => [...current, {
        paymentId: `PAY${Date.now()}`,
        appointmentId: generatedAppointmentId,
        packageId: generatedAppointmentId,
        amount: numericPaid,
        receivedDate: todaySafe(),
        receivedAt: Date.now(),
        receivedBy: newAppointment.bookedBy,
        treatment: newAppointment.treatment,
      }])
    }
    setNextReceiptNumber((curr) => Number(curr) + 1)
    logAppointmentActivity(newAppointment, "Booked")
    resetAppointmentForm()
  }

  const handleStatusChange = (index, newStatus) => {
    const target = appointments[index]
    if (!target) return

    if (newStatus === "Completed" || newStatus === "Cancelled" || newStatus === "No Show") {
      const historyItem = {
        ...target,
        status: newStatus,
        historyStatus: newStatus,
        sessionsUsed: newStatus === "Completed"
          ? Math.min(Number(target.sessions || 1), Number(target.sessionsUsed || 0) + 1)
          : Number(target.sessionsUsed || 0),
        remainingSessions: newStatus === "Completed"
          ? Math.max(0, Number(target.sessions || 1) - Math.min(Number(target.sessions || 1), Number(target.sessionsUsed || 0) + 1))
          : Number(target.remainingSessions ?? Math.max(0, Number(target.sessions || 1) - Number(target.sessionsUsed || 0))),
        historyAt: Date.now(),
        closedBy: {
          clinicId,
          userId: currentUser?.userId || username,
          name: currentUser?.name || username,
        },
      }
      setAppointmentHistory((curr) => [historyItem, ...curr])
      setAppointments((curr) => curr.filter((_, i) => i !== index))
      logAppointmentActivity(target, `Status changed to ${newStatus}`)
      if (newStatus === "Completed" && historyItem.remainingSessions > 0) {
        alert(`Session completed. ${historyItem.remainingSessions} session${historyItem.remainingSessions === 1 ? "" : "s"} remaining. You can book the next session from History.`)
      }
      return
    }

    const updated = [...appointments]
    updated[index] = { ...updated[index], status: newStatus }
    setAppointments(updated)
    logAppointmentActivity(updated[index], `Status changed to ${newStatus}`)
  }

  const handleAssignTreatment = (index) => {
    if (!assignedRoom || !assignedTherapist) {
      alert("Please select both a Room and a Therapist.")
      return
    }

    const roomBusy = appointments.some(
      (a, i) => i !== index && a.room === assignedRoom && a.status === "In Treatment"
    )
    if (roomBusy) {
      alert("This room is currently occupied with another patient.")
      return
    }

    const therapistBusy = appointments.some(
      (a, i) => i !== index && a.therapist === assignedTherapist && a.status === "In Treatment"
    )
    if (therapistBusy) {
      alert("This therapist is already in treatment with another patient.")
      return
    }

    const updated = [...appointments]
    const currentApt = {
      ...updated[index],
      room: assignedRoom,
      therapist: assignedTherapist,
      status: "In Treatment",
      treatmentStartedAt: Date.now(),
      assignedBy: {
        clinicId,
        userId: currentUser?.userId || username,
        name: currentUser?.name || username,
      },
    }
    updated[index] = currentApt
    setAppointments(updated)

    setTreatmentAssignments((curr) => [
      ...curr,
      {
        clinicId,
        appointmentId: currentApt.appointmentId,
        receiptId: currentApt.receiptId,
        room: assignedRoom,
        therapist: assignedTherapist,
        assignedAt: Date.now(),
      },
    ])
    logAppointmentActivity(currentApt, "Assigned Treatment")
    setShowAssignModal(false)
    setAssigningAppointmentIndex(null)
  }

  const handleDeleteAppointment = (index) => {
    const canDelete = ["Admin", "Manager", "Owner"].includes(currentUser?.role)
    if (!canDelete) {
      alert("Only Admin, Manager, or Owner users can delete appointments.")
      return
    }

    const target = appointments[index]
    if (!target) return
    if (Number(target.paidAmount || 0) > 0) {
      alert("Appointments with received payment cannot be deleted.")
      return
    }
    if (!window.confirm("Are you sure you want to delete this appointment?")) return
    setAppointments((curr) => curr.filter((_, i) => i !== index))
    logAppointmentActivity(target, "Deleted Appointment")
  }

  const handleWhatsAppRedirect = (appointment) => {
    let phone = (appointment.phoneNumber || "").trim().replace(/[^0-9+]/g, "")
    if (phone.startsWith("03")) {
      phone = "92" + phone.slice(1)
    } else if (phone.startsWith("+")) {
      phone = phone.slice(1)
    }

    const roomName = rooms.find((r) => r.roomId === appointment.room)?.name || "Assigned Room"
    const therapistName = staff.find((s) => s.userId === appointment.therapist)?.name || "Assigned Specialist"

    const message = encodeURIComponent(
      `*✨ ${clinic.name} - Official Booking Receipt ✨*\n\n` +
      `📄 *Receipt ID:* ${appointment.receiptId}\n` +
      `👤 *Patient Name:* ${appointment.customerName}\n` +
      `💉 *Treatment:* ${appointment.treatment}\n` +
      `🔢 *Sessions:* ${appointment.sessions || 1}\n` +
      `📅 *Date:* ${appointment.appointmentDate}\n` +
      `⏰ *Time:* ${appointment.appointmentTime} - ${appointment.endTime}\n` +
      `🚪 *Room:* ${roomName}\n` +
      `🩺 *Specialist:* ${therapistName}\n\n` +
      `💵 *Package Price:* Rs. ${Number(appointment.packagePrice || 0).toLocaleString()}\n` +
      `💳 *Paid Amount:* Rs. ${Number(appointment.paidAmount || 0).toLocaleString()}\n` +
      `⚠️ *Balance Due:* Rs. ${Number(appointment.balance || 0).toLocaleString()}\n\n` +
      `📞 *Clinic Phone:* ${clinic.phone || "-"}\n` +
      `📍 *Address:* ${clinic.address || "-"}\n\n` +
      `Thank you for choosing ${clinic.name}!\n` +
      `Operating Hours: ${clinic.openingTime} - ${clinic.closingTime}`
    )

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  // ============================================================
  // DASHBOARD CALCULATIONS & DATE SHIFTER
  // ============================================================

  const getDashboardRange = () => {
    const now = new Date()
    const todayValue = now.toLocaleDateString("en-CA")

    if (dashboardPeriod === "Today") return { from: todayValue, to: todayValue }
    if (dashboardPeriod === "Yesterday") {
      const d = new Date(now)
      d.setDate(d.getDate() - 1)
      const val = d.toLocaleDateString("en-CA")
      return { from: val, to: val }
    }
    if (dashboardPeriod === "This Week") {
      const d = new Date(now)
      const day = d.getDay()
      const offset = day === 0 ? -6 : 1 - day
      d.setDate(d.getDate() + offset)
      return { from: d.toLocaleDateString("en-CA"), to: todayValue }
    }
    if (dashboardPeriod === "This Month") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA")
      return { from, to: todayValue }
    }
    if (dashboardPeriod === "Last Month") {
      const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthEnd = new Date(firstThisMonth)
      lastMonthEnd.setDate(0)
      const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1)
      return { from: lastMonthStart.toLocaleDateString("en-CA"), to: lastMonthEnd.toLocaleDateString("en-CA") }
    }
    return { from: dashboardFromDate || todayValue, to: dashboardToDate || todayValue }
  }

  const handleDashboardShift = (direction) => {
    // Quick period shifter for Dashboard
    if (dashboardPeriod === "Today" || dashboardPeriod === "Yesterday") {
      const base = dashboardPeriod === "Today" ? new Date() : new Date(Date.now() - 86400000)
      base.setDate(base.getDate() + (direction * 1))
      const nextD = base.toLocaleDateString("en-CA")
      setDashboardPeriod("Custom Date Range")
      setDashboardFromDate(nextD)
      setDashboardToDate(nextD)
      return
    }

    if (dashboardPeriod === "This Month") {
      if (direction === -1) setDashboardPeriod("Last Month")
      return
    }

    if (dashboardPeriod === "Last Month") {
      if (direction === 1) setDashboardPeriod("This Month")
      return
    }

    if (dashboardPeriod === "Custom Date Range") {
      const from = new Date(dashboardFromDate || todaySafe())
      const to = new Date(dashboardToDate || todaySafe())
      const diffTime = Math.abs(to - from) || 86400000
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
      from.setDate(from.getDate() + (direction * diffDays))
      to.setDate(to.getDate() + (direction * diffDays))
      setDashboardFromDate(from.toLocaleDateString("en-CA"))
      setDashboardToDate(to.toLocaleDateString("en-CA"))
    }
  }

  const getDashboardRecords = () => {
    const range = getDashboardRange()
    const active = (appointments || []).filter(
      (item) => (item.clinicId || clinicId) === clinicId && item.appointmentDate >= range.from && item.appointmentDate <= range.to
    )
    const history = (appointmentHistory || []).filter(
      (item) => (item.clinicId || clinicId) === clinicId && item.appointmentDate >= range.from && item.appointmentDate <= range.to
    )
    const byId = new Map()
    active.forEach((item) => byId.set(item.appointmentId || item.receiptId || `${item.customerName}-${item.appointmentDate}-${item.appointmentTime}`, item))
    history.forEach((item) => byId.set(item.appointmentId || item.receiptId || `${item.customerName}-${item.appointmentDate}-${item.appointmentTime}`, item))
    return Array.from(byId.values())
  }

  const getReceivedPayments = useCallback((range) => {
    const allRecords = [...(appointments || []), ...(appointmentHistory || [])]
    const recordedPayments = new Map()
    ;(paymentRecords || []).forEach((payment) => {
      recordedPayments.set(payment.appointmentId, (recordedPayments.get(payment.appointmentId) || 0) + Number(payment.amount || 0))
    })
    const legacyPayments = allRecords
      .filter((item) => Number(item.paidAmount || 0) > Number(recordedPayments.get(item.appointmentId) || 0))
      .map((item) => ({
        appointmentId: item.appointmentId,
        amount: Math.max(0, Number(item.paidAmount || 0) - Number(recordedPayments.get(item.appointmentId) || 0)),
        receivedDate: item.paymentDate || new Date(item.createdAt || Date.now()).toLocaleDateString("en-CA"),
        receivedBy: item.bookedBy,
        treatment: item.treatment,
      }))

    return [...(paymentRecords || []), ...legacyPayments]
      .filter((payment) => payment.receivedDate >= range.from && payment.receivedDate <= range.to)
      .map((payment) => {
        const appointment = allRecords.find((item) => item.appointmentId === payment.appointmentId)
        return {
          ...payment,
          appointmentDate: payment.receivedDate,
          customerName: appointment?.customerName || "Unknown customer",
          treatment: payment.treatment || appointment?.treatment || "Payment",
          status: "Payment Received",
          packagePrice: Number(payment.amount || 0),
          paidAmount: Number(payment.amount || 0),
          balance: 0,
        }
      })
  }, [appointments, appointmentHistory, paymentRecords])

  const getDashboardData = () => {
    const range = getDashboardRange()
    const records = getDashboardRecords()
    const receivedPayments = getReceivedPayments(range)
    const completed = records.filter((item) => item.status === "Completed" || item.historyStatus === "Completed")
    const cancelled = records.filter((item) => item.status === "Cancelled" || item.historyStatus === "Cancelled")
    const noShow = records.filter((item) => item.status === "No Show" || item.historyStatus === "No Show")
    const upcoming = records.filter((item) => item.status === "Booked" || item.status === "Arrived" || item.status === "In Treatment")

    const validRecords = records.filter(
      (item) => item.status !== "Cancelled" && item.historyStatus !== "Cancelled" && item.status !== "No Show" && item.historyStatus !== "No Show" && item.historyStatus !== "Deleted"
    )
    const collected = receivedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const revenue = collected
    const outstanding = validRecords.reduce(
      (sum, item) => sum + Number(item.balance !== undefined ? item.balance : calculateBalance(item.packagePrice || item.price, item.paidAmount)),
      0
    )
    const staffBookingMap = {}
    const staffTherapyMap = {}

    // ============================================================
    // 1. TREATMENT PERFORMANCE ANALYTICS
    // ============================================================
    const treatmentStatsMap = {}
    receivedPayments.forEach((payment) => {
      const tName = payment.treatment || "Other / Consult"
      const paid = Number(payment.amount || 0)
      const sessions = 1

      if (!treatmentStatsMap[tName]) {
        treatmentStatsMap[tName] = { treatment: tName, sessions: 0, revenue: 0, bookings: 0 }
      }
      treatmentStatsMap[tName].sessions += sessions
      treatmentStatsMap[tName].revenue += paid
      treatmentStatsMap[tName].bookings += 1
    })

    validRecords.forEach((item) => {
      const therapistId = item.therapist || ""
      if (!therapistId) return
      const therapistStaff = staff.find((s) => s.userId === therapistId)
      if (!staffTherapyMap[therapistId]) {
        staffTherapyMap[therapistId] = {
          name: therapistStaff?.name || therapistId,
          userId: therapistId,
          role: "Therapist / Specialist",
          treatmentsCount: 0,
          sessionsCount: 0,
        }
      }
      staffTherapyMap[therapistId].treatmentsCount += 1
      staffTherapyMap[therapistId].sessionsCount += Number(item.sessions || 1)
    })

    const treatmentPerformance = Object.values(treatmentStatsMap)
      .map((t) => ({
        ...t,
        percent: collected > 0 ? Math.round((t.revenue / collected) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // ============================================================
    // 2. STAFF PERFORMANCE & SALES INCENTIVE (BASED ON PAID AMOUNT)
    // ============================================================
    const rateDecimal = Number(incentiveRate || 5) / 100

    receivedPayments.forEach((payment) => {
      const paid = Number(payment.amount || 0)
      const bookedByName = payment.receivedBy?.name || payment.receivedBy?.userId || "Front Desk / Online"
      const bookedById = payment.receivedBy?.userId || "UNKNOWN"
      // A: Booked / Brought Customer
      if (!staffBookingMap[bookedById]) {
        staffBookingMap[bookedById] = {
          name: bookedByName,
          userId: bookedById,
          role: staff.find((s) => s.userId === bookedById)?.role || "Staff / Admin",
          bookingsCount: 0,
          collectedRevenue: 0,
          incentive: 0,
        }
      }
      staffBookingMap[bookedById].bookingsCount += 1
      staffBookingMap[bookedById].collectedRevenue += paid
      staffBookingMap[bookedById].incentive = Math.round(staffBookingMap[bookedById].collectedRevenue * rateDecimal)

    })

    // Include all active clinic therapists so their working hours and activity are visible
    staff
      .filter((s) => s.role === "Therapist" && s.clinicId === clinicId && s.status === "Active")
      .forEach((therapist) => {
        if (!staffTherapyMap[therapist.userId]) {
          staffTherapyMap[therapist.userId] = {
            name: therapist.name,
            userId: therapist.userId,
            role: "Therapist / Specialist",
            treatmentsCount: 0,
            sessionsCount: 0,
          }
        }
      })

    // Helper: calculate total login/working hours for a therapist in the selected period
    const getTherapistWorkingHours = (userId, r) => {
      const pastLogs = (staffWorkLogs || []).filter(
        (log) => log.userId === userId && log.date >= r.from && log.date <= r.to
      )
      let totalMs = pastLogs.reduce((sum, log) => sum + Number(log.durationMs || 0), 0)

      const todayVal = todaySafe()
      if (todayVal >= r.from && todayVal <= r.to) {
        const activeEntry = (activeStaff || []).find((m) => m.userId === userId)
        if (activeEntry && (activeEntry.loggedInAt || activeEntry.activeSince)) {
          const startTime = Number(activeEntry.loggedInAt || activeEntry.activeSince)
          totalMs += Math.max(0, Date.now() - startTime)
        }
      }

      const totalMinutes = Math.round(totalMs / (1000 * 60))
      if (totalMinutes < 1) return "0 hrs"
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      if (hours === 0) return `${mins}m`
      if (mins === 0) return `${hours} hrs`
      return `${hours}h ${mins}m`
    }

    // Attach working hours to each therapist record
    Object.keys(staffTherapyMap).forEach((tId) => {
      staffTherapyMap[tId].workingHours = getTherapistWorkingHours(tId, range)
    })

    const staffBookingPerformance = Object.values(staffBookingMap).sort((a, b) => b.collectedRevenue - a.collectedRevenue)
    const staffTherapyPerformance = Object.values(staffTherapyMap).sort((a, b) => b.treatmentsCount - a.treatmentsCount)

    return {
      records,
      appointments: records.length,
      completed,
      cancelled,
      noShow,
      upcoming,
      treatments: completed.length,
      revenue,
      collected,
      outstanding,
      receivedPayments,
      treatmentPerformance,
      staffBookingPerformance,
      staffTherapyPerformance,
    }
  }

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`
  const dashboardData = getDashboardData()
  const profileIncentive = useMemo(() => {
    if (!currentUser) return { receivedCash: 0, incentive: 0, fullyPaid: 0, appointments: 0 }

    const recordsById = new Map()
    ;[...(appointments || []), ...(appointmentHistory || [])].forEach((item) => {
      const recordId = item.appointmentId || `${item.customerName}-${item.appointmentDate}-${item.appointmentTime}`
      recordsById.set(recordId, item)
    })
    const ownPayments = getReceivedPayments({ from: "0000-01-01", to: "9999-12-31" }).filter(
      (payment) => payment.receivedBy?.userId === currentUser.userId
    )
    const ownAppointments = Array.from(recordsById.values()).filter((item) => item.bookedBy?.userId === currentUser.userId)
    const receivedCash = ownPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const fullyPaid = ownAppointments.filter((item) => Number(item.balance || 0) <= 0 && Number(item.paidAmount || 0) > 0).length
    return {
      receivedCash,
      incentive: Math.round(receivedCash * (Number(incentiveRate || 5) / 100)),
      fullyPaid,
      appointments: ownAppointments.length,
    }
  }, [currentUser, incentiveRate, getReceivedPayments, appointments, appointmentHistory])
  const canDeleteAppointments = ["Admin", "Manager", "Owner"].includes(currentUser?.role)

  // ============================================================
  // FILTERED APPOINTMENTS & TOP SUMMARY STATS (Option 1 & 2)
  // ============================================================

  const dayAppointments = useMemo(() => {
    const activeForDay = appointments
      .map((apt, index) => ({ apt, index }))
      .filter(({ apt }) => apt.appointmentDate === selectedDate)
    const completedForDay = appointmentHistory
      .map((apt, historyIndex) => ({ apt, index: null, historyIndex, isHistorical: true }))
      .filter(({ apt }) => (
        apt.appointmentDate === selectedDate &&
        (apt.historyStatus === "Completed" || apt.status === "Completed")
      ))

    return [...activeForDay, ...completedForDay]
  }, [appointments, appointmentHistory, selectedDate])

  const filteredDayAppointments = useMemo(() => {
    return dayAppointments.filter(({ apt }) => {
      const matchesSearch =
        !searchQuery ||
        (apt.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.phoneNumber || "").includes(searchQuery) ||
        (apt.receiptId || "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "All" || apt.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [dayAppointments, searchQuery, statusFilter])

  // Cumulative KPI Summary (Option 1 embedded into Option 2)
  const kpiStats = useMemo(() => {
    const receivedPayments = getReceivedPayments({ from: selectedDate, to: selectedDate })
    const total = dayAppointments.length
    const active = dayAppointments.filter(({ apt }) => apt.status === "In Treatment" || apt.status === "Arrived").length
    const done = dayAppointments.filter(({ apt }) => apt.status === "Completed").length
    const collected = receivedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const revenue = dayAppointments.reduce((sum, { apt }) => sum + Number(apt.packagePrice || 0), 0)
    return { total, active, done, collected, revenue }
  }, [dayAppointments, selectedDate, getReceivedPayments])

  const selectedAppointment = useMemo(() => {
    if (dayAppointments.length === 0) return null
    if (selectedAppointmentKey) {
      const selected = dayAppointments.find(({ apt }) => (
        (apt.appointmentId || apt.receiptId) === selectedAppointmentKey
      ))
      if (selected) return selected
    }
    return dayAppointments[Math.min(selectedAppointmentIndex, dayAppointments.length - 1)]
  }, [dayAppointments, selectedAppointmentIndex, selectedAppointmentKey])

  // ============================================================
  // UNAUTHENTICATED LOGIN SCREEN
  // ============================================================

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">🏥</div>
          <h1>{clinic.name}</h1>
          <p>Clinic Portal & Booking System</p>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label>User ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username or ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary-cta" style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "10px" }}>
              Sign In to Clinic
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ============================================================
  // AUTHENTICATED APPLICATION
  // ============================================================

  return (
    <div className="clinic-app">
      {/* 1. TOP HEADER & BRANDING */}
      <header className="clinic-header">
        <div className="clinic-header-top">
          <div className="clinic-brand">
            <div className="clinic-logo-icon">S</div>
            <div className="clinic-brand-text">
              <h1>{clinic.name}</h1>
              <span>{clinicId} • Aesthetic Clinic Management</span>
            </div>
          </div>

          <div className="clinic-header-actions">
            <button className="btn-primary-cta" onClick={openNewAppointmentForm}>
              <span>+</span> New Appointment
            </button>

            <button
              type="button"
              className="user-badge"
              onClick={openProfile}
              title="Open profile"
              style={{ cursor: "pointer", border: "none" }}
            >
              <span>👤 {currentUser?.name}</span>
              <span className="role-pill">{currentUser?.role}</span>
            </button>

            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <nav className="clinic-nav-tabs">
          {["Admin", "Owner"].includes(currentUser?.role) && (
            <button
              className={`nav-tab-btn ${activeSection === "Dashboard" ? "active" : ""}`}
              onClick={() => setActiveSection("Dashboard")}
            >
              📊 Dashboard
            </button>
          )}

          <button
            className={`nav-tab-btn ${activeSection === "Appointments" ? "active" : ""}`}
            onClick={() => setActiveSection("Appointments")}
          >
            📅 Appointments ({dayAppointments.length})
          </button>

          <button
            className={`nav-tab-btn ${activeSection === "History" ? "active" : ""}`}
            onClick={() => setActiveSection("History")}
          >
            📜 History ({appointmentHistory.length})
          </button>

          {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
            <button
              className={`nav-tab-btn ${activeSection === "Clinic" ? "active" : ""}`}
              onClick={() => setActiveSection("Clinic")}
            >
              🏥 Clinic Settings
            </button>
          )}
        </nav>
      </header>

      {/* 2. MAIN TAB CONTENT */}
      <main className="clinic-main-content">
        {/* ======================================================
            APPOINTMENTS TAB (Option 2 Split-View + Option 1 Stats)
        ====================================================== */}
        {activeSection === "Appointments" && (
          <div>
            {/* DATE NAVIGATOR BAR - DEDICATED TO APPOINTMENTS TAB */}
            <div className="date-navigator-bar" style={{ borderRadius: "10px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              <div className="date-controls">
                <button className="btn-date-nav" onClick={() => handleShiftDate(-1)}>◀ Prev Day</button>
                <button className="btn-date-nav" onClick={() => setSelectedDate(todaySafe())}>Today</button>
                <button className="btn-date-nav" onClick={() => handleShiftDate(1)}>Next Day ▶</button>
                <input
                  type="date"
                  className="date-picker-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Selected: <strong>{selectedDate}</strong> (Operating: {clinic.openingTime || "13:30"} - {clinic.closingTime || "21:00"})
              </div>
            </div>

            {/* TOP CUMULATIVE KPI SUMMARY BAR (OPTION 1 FEATURE) */}
            <div className="kpi-summary-grid">
              <div className="kpi-card">
                <div className="kpi-icon-box" style={{ background: "#eff6ff", color: "#1d4ed8" }}>📅</div>
                <div className="kpi-info-box">
                  <div className="kpi-label">Total Bookings</div>
                  <div className="kpi-value" style={{ color: "#1e3a8a" }}>{kpiStats.total}</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box" style={{ background: "#f3e8ff", color: "#7e22ce" }}>⚡</div>
                <div className="kpi-info-box">
                  <div className="kpi-label">Active Patients</div>
                  <div className="kpi-value" style={{ color: "#581c87" }}>{kpiStats.active}</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box" style={{ background: "#dcfce7", color: "#15803d" }}>✅</div>
                <div className="kpi-info-box">
                  <div className="kpi-label">Completed</div>
                  <div className="kpi-value" style={{ color: "#14532d" }}>{kpiStats.done}</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box" style={{ background: "#ecfdf5", color: "#047857" }}>💰</div>
                <div className="kpi-info-box">
                  <div className="kpi-label">Collected Today</div>
                  <div className="kpi-value" style={{ color: "#064e3b" }}>{formatCurrency(kpiStats.collected)}</div>
                </div>
              </div>
            </div>

            {/* SPLIT PANE CONTAINER (OPTION 2 FEATURE) */}
            <div className="split-pane-layout">
              {/* LEFT SIDE: SEARCH & TABLE (65%) */}
              <div className="table-panel-card">
                <div className="table-toolbar">
                  <input
                    type="text"
                    className="table-search-input"
                    placeholder="🔍 Search patient, phone, receipt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="status-filter-pills">
                    {["All", "Booked", "Arrived", "In Treatment", "Completed"].map((st) => (
                      <button
                        key={st}
                        className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
                        onClick={() => setStatusFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. DESKTOP DATA TABLE (Visible on Desktop & Laptop) */}
                <div className="data-table-container desktop-table-view">
                  {filteredDayAppointments.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                      <p style={{ fontSize: "16px", fontWeight: 600 }}>No appointments found for {selectedDate}</p>
                      <p style={{ fontSize: "13px", marginTop: "6px" }}>Click "+ New Appointment" to schedule a patient booking.</p>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Customer</th>
                          <th>Treatment</th>
                          <th>Room & Therapist</th>
                          <th>Status</th>
                          <th>Total / Due</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDayAppointments.map(({ apt, index, isHistorical }) => {
                          const isSelected = selectedAppointment && (
                            (selectedAppointment.apt.appointmentId || selectedAppointment.apt.receiptId) === (apt.appointmentId || apt.receiptId)
                          )
                          const roomObj = rooms.find((r) => r.roomId === apt.room)
                          const staffObj = staff.find((s) => s.userId === apt.therapist)

                          return (
                            <tr
                              key={apt.appointmentId || index}
                              className={isSelected ? "selected" : ""}
                              onClick={() => {
                                setSelectedAppointmentIndex(index)
                                setSelectedAppointmentKey(apt.appointmentId || apt.receiptId)
                              }}
                            >
                              <td style={{ fontWeight: 600 }}>
                                {apt.appointmentTime}
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                                  {apt.endTime} ({apt.duration}m)
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{apt.customerName}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{apt.phoneNumber}</div>
                              </td>

                              <td>
                                <span className="badge-pill" style={{ background: "#f1f5f9", color: "#334155" }}>
                                  💉 {apt.treatment}
                                </span>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span className="badge-pill badge-room">
                                    🚪 {roomObj?.name || apt.room || "No Room"}
                                  </span>
                                  {apt.therapist && (
                                    <span className="badge-pill badge-therapist">
                                      👤 {staffObj?.name || apt.therapist}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <span className={`badge-pill badge-status-${(apt.status || "booked").toLowerCase().replace(" ", "")}`}>
                                  {apt.status}
                                </span>
                              </td>

                              <td>
                                <div style={{ fontWeight: 600 }}>{formatCurrency(apt.packagePrice)}</div>
                                {Number(apt.balance) > 0 && (
                                  <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>
                                    Due: {formatCurrency(apt.balance)}
                                  </div>
                                )}
                              </td>

                              <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                  <button
                                    title="WhatsApp Receipt"
                                    onClick={() => handleWhatsAppRedirect(apt)}
                                    style={{
                                      background: "#dcfce7",
                                      color: "#15803d",
                                      border: "1px solid #bbf7d0",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                    }}
                                  >
                                    💬
                                  </button>
                                  {isHistorical && apt.historyStatus === "Completed" && !apt.followUpBooked && getRemainingSessions(apt) > 0 && (
                                    <button
                                      title="Book next session"
                                      onClick={() => openFollowUpForm(apt, filteredDayAppointments.find((item) => item.apt === apt)?.historyIndex)}
                                      style={{
                                        background: "#dbeafe",
                                        color: "#1d4ed8",
                                        border: "1px solid #bfdbfe",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                      }}
                                    >
                                      📅
                                    </button>
                                  )}
                                  {!isHistorical && canDeleteAppointments && <button
                                    title="Delete"
                                    onClick={() => handleDeleteAppointment(index)}
                                    style={{
                                      background: "#fee2e2",
                                      color: "#dc2626",
                                      border: "1px solid #fecaca",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                    }}
                                  >
                                    🗑️
                                  </button>}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 2. MOBILE APPOINTMENT CARDS (Visible on Phones & Tablets) */}
                <div className="mobile-cards-view">
                  {filteredDayAppointments.length === 0 ? (
                    <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)" }}>
                      <p style={{ fontSize: "15px", fontWeight: 600 }}>No appointments found for {selectedDate}</p>
                      <p style={{ fontSize: "12px", marginTop: "4px" }}>Tap "+ New Appointment" to book a patient.</p>
                    </div>
                  ) : (
                    filteredDayAppointments.map(({ apt, index, isHistorical }) => {
                      const roomObj = rooms.find((r) => r.roomId === apt.room)
                      const staffObj = staff.find((s) => s.userId === apt.therapist)

                      return (
                        <div
                          key={apt.appointmentId || index}
                          className="mobile-appointment-card"
                          onClick={() => {
                            setSelectedAppointmentIndex(index)
                            setSelectedAppointmentKey(apt.appointmentId || apt.receiptId)
                          }}
                        >
                          <div className="mobile-card-top">
                            <div className="mobile-card-patient">
                              <div className="mobile-patient-avatar">
                                {(apt.customerName || "P").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="mobile-patient-name">{apt.customerName}</div>
                                <div className="mobile-patient-phone">📞 {apt.phoneNumber}</div>
                              </div>
                            </div>
                            <span className={`badge-pill badge-status-${(apt.status || "booked").toLowerCase().replace(" ", "")}`}>
                              {apt.status}
                            </span>
                          </div>

                          <div className="mobile-card-meta">
                            <span>⏱️ <strong>{apt.appointmentTime}</strong> - {apt.endTime} ({apt.duration}m)</span>
                            <span>💉 <strong>{apt.treatment}</strong></span>
                            {roomObj && <span>🚪 {roomObj.name}</span>}
                            {staffObj && <span>👤 {staffObj.name}</span>}
                          </div>

                          <div className="mobile-card-financial">
                            <span>Total: <strong>{formatCurrency(apt.packagePrice)}</strong></span>
                            <span style={{ color: "#16a34a" }}>Paid: <strong>{formatCurrency(apt.paidAmount)}</strong></span>
                            {Number(apt.balance) > 0 ? (
                              <span style={{ color: "#dc2626" }}>Due: <strong>{formatCurrency(apt.balance)}</strong></span>
                            ) : (
                              <span style={{ color: "#16a34a" }}>Paid in Full</span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", minWidth: "42px" }}>Status:</label>
                            <select
                              className="form-control"
                              style={{ padding: "4px 8px", fontSize: "12px", height: "30px", fontWeight: 600 }}
                              value={apt.status}
                              onChange={(e) => handleStatusChange(index, e.target.value)}
                              disabled={isHistorical}
                            >
                              <option value="Booked">Booked</option>
                              <option value="Arrived">Arrived</option>
                              <option value="In Treatment">In Treatment</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="No Show">No Show</option>
                            </select>
                          </div>

                          <div className="mobile-card-actions">
                            <button
                              className="mobile-btn-action"
                              style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                              onClick={() => handleWhatsAppRedirect(apt)}
                            >
                              💬 WhatsApp
                            </button>

                            {isHistorical && apt.historyStatus === "Completed" && !apt.followUpBooked && getRemainingSessions(apt) > 0 && (
                              <button
                                className="mobile-btn-action"
                                style={{ background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
                                onClick={() => openFollowUpForm(apt, filteredDayAppointments.find((item) => item.apt === apt)?.historyIndex)}
                              >
                                📅 Book Next Session ({getRemainingSessions(apt)})
                              </button>
                            )}

                            {!isHistorical && apt.status === "Arrived" && (
                              <button
                                className="mobile-btn-action"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd" }}
                                onClick={() => {
                                  setAssigningAppointmentIndex(index)
                                  const firstFreeRoom = rooms.find((r) => r.status === "Active")
                                  const firstFreeTherapist = getAvailableTherapists()[0]
                                  setAssignedRoom(firstFreeRoom?.roomId || "")
                                  setAssignedTherapist(firstFreeTherapist?.userId || "")
                                  setShowAssignModal(true)
                                }}
                              >
                                ⚡ Assign
                              </button>
                            )}

                            {!isHistorical && <button
                              className="mobile-btn-action"
                              style={{ background: "#f1f5f9", color: "var(--text-main)", border: "1px solid var(--border)" }}
                              onClick={() => openRescheduleForm(apt, index)}
                            >
                              🕒 Reschedule
                            </button>}

                            {!isHistorical && <button
                              className="mobile-btn-action"
                              style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", maxWidth: "45px", minWidth: "36px" }}
                              onClick={() => handleDeleteAppointment(index)}
                              title="Delete"
                            >
                              🗑️
                            </button>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: PATIENT INSPECTOR PANEL (Desktop Only) */}
              <div className="inspector-panel desktop-inspector">
                {selectedAppointment ? (
                  <div>
                    <div className="inspector-header">
                      <div className="patient-avatar">
                        {(selectedAppointment.apt.customerName || "P").charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-info">
                        <h3>{selectedAppointment.apt.customerName}</h3>
                        <span>📞 {selectedAppointment.apt.phoneNumber}</span>
                        <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                          ID: {selectedAppointment.apt.receiptId}
                        </div>
                      </div>
                    </div>

                    <div className="inspector-section">
                      <div className="inspector-row">
                        <span className="label">Treatment</span>
                        <span className="val">{selectedAppointment.apt.treatment}</span>
                      </div>
                      <div className="inspector-row">
                        <span className="label">Schedule</span>
                        <span className="val">{selectedAppointment.apt.appointmentTime} - {selectedAppointment.apt.endTime}</span>
                      </div>
                      <div className="inspector-row">
                        <span className="label">Duration</span>
                        <span className="val">{selectedAppointment.apt.duration} mins ({selectedAppointment.apt.sessions || 1} Session)</span>
                      </div>
                    </div>

                    <div className="inspector-section">
                      <div className="inspector-row">
                        <span className="label">Room</span>
                        <span className="val">
                          {rooms.find((r) => r.roomId === selectedAppointment.apt.room)?.name || "Unassigned"}
                        </span>
                      </div>
                      <div className="inspector-row">
                        <span className="label">Therapist</span>
                        <span className="val">
                          {staff.find((s) => s.userId === selectedAppointment.apt.therapist)?.name || "Unassigned"}
                        </span>
                      </div>
                      {selectedAppointment.apt.status === "Arrived" && (
                        <button
                          className="btn-primary-cta"
                          style={{ width: "100%", justifyContent: "center", padding: "6px", marginTop: "6px", fontSize: "12px" }}
                          onClick={() => {
                            setAssigningAppointmentIndex(selectedAppointment.index)
                            const firstFreeRoom = rooms.find((r) => r.status === "Active")
                            const firstFreeTherapist = getAvailableTherapists()[0]
                            setAssignedRoom(firstFreeRoom?.roomId || "")
                            setAssignedTherapist(firstFreeTherapist?.userId || "")
                            setShowAssignModal(true)
                          }}
                        >
                          ⚡ Assign Room & Specialist
                        </button>
                      )}
                    </div>

                    <div className="inspector-section">
                      <div className="inspector-row">
                        <span className="label">Total Price</span>
                        <span className="val">{formatCurrency(selectedAppointment.apt.packagePrice)}</span>
                      </div>
                      <div className="inspector-row">
                        <span className="label">Paid Amount</span>
                        <span className="val" style={{ color: "#16a34a" }}>{formatCurrency(selectedAppointment.apt.paidAmount)}</span>
                      </div>
                      <div className="inspector-row">
                        <span className="label">Remaining Due</span>
                        <span className="val" style={{ color: Number(selectedAppointment.apt.balance) > 0 ? "#dc2626" : "#16a34a" }}>
                          {formatCurrency(selectedAppointment.apt.balance)}
                        </span>
                      </div>
                    </div>

                    {/* STATUS CHANGER */}
                    <div style={{ marginTop: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                        Update Status
                      </label>
                      <select
                        className="form-control"
                        value={selectedAppointment.apt.status}
                        onChange={(e) => handleStatusChange(selectedAppointment.index, e.target.value)}
                        disabled={selectedAppointment.isHistorical}
                        style={{ fontWeight: 600 }}
                      >
                        <option value="Booked">Booked</option>
                        <option value="Arrived">Arrived</option>
                        <option value="In Treatment">In Treatment</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </div>

                    {/* WHATSAPP CTA */}
                    <button
                      className="btn-whatsapp-cta"
                      onClick={() => handleWhatsAppRedirect(selectedAppointment.apt)}
                    >
                      💬 Send WhatsApp Receipt
                    </button>

                    <div className="inspector-action-buttons">
                      {selectedAppointment.isHistorical && selectedAppointment.apt.historyStatus === "Completed" && !selectedAppointment.apt.followUpBooked && getRemainingSessions(selectedAppointment.apt) > 0 && (
                        <button
                          className="btn-primary-cta"
                          onClick={() => openFollowUpForm(selectedAppointment.apt, selectedAppointment.historyIndex)}
                        >
                          📅 Book Next Session ({getRemainingSessions(selectedAppointment.apt)})
                        </button>
                      )}
                      {!selectedAppointment.isHistorical && <button
                        className="btn-secondary"
                        onClick={() => openRescheduleForm(selectedAppointment.apt, selectedAppointment.index)}
                      >
                        🕒 Reschedule
                      </button>}
                      {!selectedAppointment.isHistorical && <button
                        className="btn-danger"
                        onClick={() => handleDeleteAppointment(selectedAppointment.index)}
                      >
                        🗑️ Delete
                      </button>}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "14px" }}>Select an appointment from the table to view patient details & actions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            DASHBOARD TAB (MANAGEMENT DASHBOARD + ANALYTICS)
        ====================================================== */}
        {activeSection === "Dashboard" && ["Admin", "Owner"].includes(currentUser?.role) && (
          <div>
            <div className="content-card">
              {/* DASHBOARD HEADER & PERIOD SHIFTER */}
              <div className="content-header">
                <div>
                  <h2>Executive Management Dashboard</h2>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Reporting Window: <strong>{getDashboardRange().from}</strong> → <strong>{getDashboardRange().to}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn-date-nav" onClick={() => handleDashboardShift(-1)}>◀ Prev</button>
                  <button className="btn-date-nav" onClick={() => setDashboardPeriod("Today")}>Today</button>
                  <button className="btn-date-nav" onClick={() => handleDashboardShift(1)}>Next ▶</button>

                  <select
                    className="form-control"
                    style={{ width: "auto", fontWeight: 600 }}
                    value={dashboardPeriod}
                    onChange={(e) => {
                      setDashboardPeriod(e.target.value)
                      setDashboardDrilldown(null)
                    }}
                  >
                    <option>Today</option>
                    <option>Yesterday</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Custom Date Range</option>
                  </select>
                </div>
              </div>

              {dashboardPeriod === "Custom Date Range" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>
                    From: <input type="date" className="form-control" value={dashboardFromDate} onChange={(e) => setDashboardFromDate(e.target.value)} />
                  </label>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>
                    To: <input type="date" className="form-control" value={dashboardToDate} onChange={(e) => setDashboardToDate(e.target.value)} />
                  </label>
                </div>
              )}

              {/* ACTIVITY METRICS CARDS */}
              <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                ACTIVITY & OPERATIONS
              </h3>
              <div className="kpi-summary-grid" style={{ marginBottom: "24px" }}>
                {[
                  { label: "Appointments", val: dashboardData.appointments, records: dashboardData.records, bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
                  { label: "Completed", val: dashboardData.completed.length, records: dashboardData.completed, bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d" },
                  { label: "Upcoming", val: dashboardData.upcoming.length, records: dashboardData.upcoming, bg: "#faf5ff", border: "#e9d5ff", color: "#581c87" },
                  { label: "Cancelled", val: dashboardData.cancelled.length, records: dashboardData.cancelled, bg: "#fef2f2", border: "#fecaca", color: "#7f1d1d" },
                  { label: "No Show", val: dashboardData.noShow.length, records: dashboardData.noShow, bg: "#fffbeb", border: "#fde68a", color: "#78350f" },
                  { label: "Treatments", val: dashboardData.treatments, records: dashboardData.completed, bg: "#f0fdfa", border: "#99f6e4", color: "#134e4a" },
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setDashboardDrilldown({ title: c.label, records: c.records })}
                    style={{
                      background: c.bg,
                      border: `1.5px solid ${c.border}`,
                      borderRadius: "10px",
                      padding: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: c.color }}>{c.label}</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: c.color, marginTop: "4px" }}>{c.val}</div>
                  </button>
                ))}
              </div>

              {/* FINANCIAL SUMMARY CARDS */}
              <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                FINANCIAL PERFORMANCE
              </h3>
              <div className="kpi-summary-grid">
                {[
                  { label: "Revenue (Cash Received)", val: formatCurrency(dashboardData.revenue), records: dashboardData.receivedPayments, bg: "#ecfdf5", border: "#6ee7b7", color: "#064e3b" },
                  { label: "Collected Cash / Paid", val: formatCurrency(dashboardData.collected), records: dashboardData.receivedPayments, bg: "#eff6ff", border: "#93c5fd", color: "#172554" },
                  { label: "Outstanding Receivables", val: formatCurrency(dashboardData.outstanding), records: dashboardData.records.filter((a) => Number(a.balance) > 0), bg: "#fff1f2", border: "#fecdd3", color: "#881337" },
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setDashboardDrilldown({ title: c.label, records: c.records })}
                    style={{
                      background: c.bg,
                      border: `1.5px solid ${c.border}`,
                      borderRadius: "10px",
                      padding: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 600, color: c.color }}>{c.label}</div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: c.color, marginTop: "4px" }}>{c.val}</div>
                  </button>
                ))}
              </div>

              {/* DRILLDOWN TABLE */}
              {dashboardDrilldown && (
                <div style={{ marginTop: "24px", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "16px", background: "#fff", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{dashboardDrilldown.title} Details</h3>
                    <button className="btn-secondary" onClick={() => setDashboardDrilldown(null)}>Close ✕</button>
                  </div>

                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Treatment</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Total</th>
                          <th style={{ textAlign: "right" }}>Paid</th>
                          <th style={{ textAlign: "right" }}>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardDrilldown.records.map((item, idx) => (
                          <tr key={item.appointmentId || idx}>
                            <td>{item.appointmentDate}</td>
                            <td style={{ fontWeight: 600 }}>{item.customerName}</td>
                            <td>{item.treatment}</td>
                            <td>
                              <span className="badge-pill" style={{ background: "#f1f5f9" }}>{item.status || item.historyStatus}</span>
                            </td>
                            <td style={{ textAlign: "right" }}>{formatCurrency(item.packagePrice || item.price)}</td>
                            <td style={{ textAlign: "right", color: "#16a34a" }}>{formatCurrency(item.paidAmount)}</td>
                            <td style={{ textAlign: "right", color: "#dc2626" }}>{formatCurrency(item.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================
                3. TREATMENT PERFORMANCE ANALYTICS SECTION
            ====================================================== */}
            <div className="content-card">
              <div className="content-header">
                <div>
                  <h2>💉 Treatment Performance</h2>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Breakdown of services sold, session counts, and revenue contribution
                  </span>
                </div>
              </div>

              <div className="data-table-container">
                {dashboardData.treatmentPerformance.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No treatment sales recorded for this reporting period.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Treatment</th>
                        <th style={{ textAlign: "center" }}>Sessions / Bookings</th>
                        <th style={{ textAlign: "right" }}>Collected Revenue</th>
                        <th style={{ textAlign: "right" }}>% of Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.treatmentPerformance.map((t, idx) => (
                        <tr key={t.treatment || idx}>
                          <td style={{ fontWeight: 600, color: "var(--text-main)" }}>
                            💉 {t.treatment}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600 }}>
                            {t.sessions} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({t.bookings} bookings)</span>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600, color: "#065f46" }}>
                            {formatCurrency(t.revenue)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                              <div style={{ width: "80px", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(100, t.percent)}%`, height: "100%", background: "var(--primary)" }} />
                              </div>
                              <strong style={{ minWidth: "36px" }}>{t.percent}%</strong>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ======================================================
                4. STAFF PERFORMANCE & INCENTIVE SYSTEM
            ====================================================== */}
            <div className="content-card">
              <div className="content-header">
                <div>
                  <h2>👥 Staff Performance & Incentive System</h2>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Incentives calculated on <strong>actual paid amounts</strong> received (unpaid dues are factored when collected)
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Incentive Rate:</label>
                  <select
                    className="form-control"
                    style={{ width: "auto", fontWeight: 600 }}
                    value={incentiveRate}
                    onChange={(e) => setIncentiveRate(Number(e.target.value))}
                  >
                    <option value={3}>3% Commission</option>
                    <option value={5}>5% Commission</option>
                    <option value={8}>8% Commission</option>
                    <option value={10}>10% Commission</option>
                  </select>
                </div>
              </div>

              {/* SECTION A: BOOKING / SALES PERFORMANCE (WHO BROUGHT THE CUSTOMER) */}
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px", marginTop: "10px" }}>
                🎯 Sales & Booking Attribution (Who Brought / Booked Patient)
              </h3>
              <div className="data-table-container" style={{ marginBottom: "24px" }}>
                {dashboardData.staffBookingPerformance.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                    No bookings attributed for this period.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Staff Member (Booked By)</th>
                        <th>Role</th>
                        <th style={{ textAlign: "center" }}>Bookings Count</th>
                        <th style={{ textAlign: "right" }}>Collected Revenue</th>
                        <th style={{ textAlign: "right" }}>Sales Incentive ({incentiveRate}%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.staffBookingPerformance.map((s, idx) => (
                        <tr key={s.userId || idx}>
                          <td style={{ fontWeight: 600 }}>
                            👤 {s.name} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({s.userId})</span>
                          </td>
                          <td>
                            <span className="role-pill">{s.role}</span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600 }}>{s.bookingsCount}</td>
                          <td style={{ textAlign: "right", fontWeight: 600, color: "#065f46" }}>
                            {formatCurrency(s.collectedRevenue)}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>
                            {formatCurrency(s.incentive)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* SECTION B: TREATMENT EXECUTION PERFORMANCE (WHO PERFORMED TREATMENT) */}
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                🩺 Treatment Execution (Specialists / Therapists)
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Performance view only — incentives are awarded to the <strong>person who booked/brought</strong> the patient, not the therapist.
              </p>
              <div className="data-table-container">
                {dashboardData.staffTherapyPerformance.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                    No treatments assigned to specialists for this period.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Specialist / Therapist</th>
                        <th>Role</th>
                        <th style={{ textAlign: "center" }}>⏱️ Working Hours</th>
                        <th style={{ textAlign: "center" }}>Treatments Performed</th>
                        <th style={{ textAlign: "center" }}>Total Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.staffTherapyPerformance.map((s, idx) => (
                        <tr key={s.userId || idx}>
                          <td style={{ fontWeight: 600 }}>
                            🩺 {s.name} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({s.userId})</span>
                          </td>
                          <td>
                            <span className="badge-pill badge-therapist">{s.role}</span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600, color: "#1e40af" }}>
                            {s.workingHours || "0 hrs"}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 700, fontSize: "16px", color: "var(--primary)" }}>
                            {s.treatmentsCount}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600, color: "#0d9488" }}>
                            {s.sessionsCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            HISTORY TAB
        ====================================================== */}
        {activeSection === "History" && (
          <div className="content-card">
            <div className="content-header">
              <h2>Appointment History & Closed Logs</h2>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Closed Events: {appointmentHistory.length}</span>
            </div>

            <div className="data-table-container">
              {appointmentHistory.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No closed appointment history yet.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt ID</th>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Treatment</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentHistory.map((item, idx) => {
                      const remainingSessions = getRemainingSessions(item)
                      return (
                      <tr key={item.appointmentId || idx}>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>{item.receiptId || "-"}</td>
                        <td>{item.appointmentDate} {item.appointmentTime}</td>
                        <td style={{ fontWeight: 600 }}>{item.customerName}</td>
                        <td>{item.treatment}</td>
                        <td>
                          <span className={`badge-pill badge-status-${(item.historyStatus || item.status || "").toLowerCase().replace(" ", "")}`}>
                            {item.historyStatus || item.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.packagePrice || item.price)}</td>
                        <td style={{ color: "#16a34a" }}>{formatCurrency(item.paidAmount)}</td>
                        <td style={{ color: "#dc2626" }}>{formatCurrency(item.balance)}</td>
                        <td style={{ textAlign: "right" }}>
                          {["Completed", "Cancelled", "No Show"].includes(item.historyStatus) && !item.followUpBooked && remainingSessions > 0 && (
                            <button
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => openFollowUpForm(item, idx)}
                            >
                              {item.historyStatus === "Completed" ? "Book Next Session" : "Rebook Appointment"} ({remainingSessions})
                            </button>
                          )}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ======================================================
            STAFF TAB
        ====================================================== */}
        {activeSection === "Clinic" && ["Admin", "Manager", "Owner"].includes(currentUser?.role) && clinicSettingsTab === "Staff" && (
          <div className="content-card">
            <div className="content-header">
              <h2>Staff & Therapists Management</h2>
              {["Admin", "Owner"].includes(currentUser?.role) && (
                <button
                  className="btn-primary-cta"
                  onClick={() => {
                    resetStaffForm()
                    setShowStaffForm(true)
                  }}
                >
                  + Add Staff Member
                </button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>On Duty</th>
                    {["Admin", "Owner"].includes(currentUser?.role) && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member, idx) => {
                    const isOnDuty = activeStaff.some((a) => a.userId === member.userId)
                    return (
                      <tr key={member.userId || idx}>
                        <td style={{ fontWeight: 600 }}>{member.userId}</td>
                        <td style={{ fontWeight: 600 }}>{member.name}</td>
                        <td>
                          <span className="role-pill">{member.role}</span>
                        </td>
                        <td>
                          <span className="badge-pill" style={{ background: member.status === "Active" ? "#dcfce7" : "#fee2e2", color: member.status === "Active" ? "#166534" : "#991b1b" }}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: isOnDuty ? "#16a34a" : "#94a3b8" }}>
                            {isOnDuty ? "🟢 Logged In" : "⚪ Offline"}
                          </span>
                        </td>
                        {["Admin", "Owner"].includes(currentUser?.role) && (
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                              <button
                                className="btn-secondary"
                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                onClick={() => {
                                  setEditingStaffIndex(idx)
                                  setStaffName(member.name)
                                  setStaffPassword(member.password)
                                  setStaffRole(member.role)
                                  setStaffStatus(member.status)
                                  setShowStaffForm(true)
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className={member.status === "Active" ? "btn-danger" : "btn-secondary"}
                                style={{ padding: "4px 10px", fontSize: "12px" }}
                                onClick={() => {
                                  const updated = [...staff]
                                  updated[idx] = { ...member, status: member.status === "Active" ? "Inactive" : "Active" }
                                  setStaff(updated)
                                }}
                              >
                                {member.status === "Active" ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================
            TREATMENTS TAB
        ====================================================== */}
        {activeSection === "Clinic" && ["Admin", "Manager", "Owner"].includes(currentUser?.role) && clinicSettingsTab === "Treatments" && (
          <div className="content-card">
            <div className="content-header">
              <h2>Treatments & Services Catalog</h2>
              {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                <button
                  className="btn-primary-cta"
                  onClick={() => {
                    resetTreatmentForm()
                    setShowTreatmentForm(true)
                  }}
                >
                  + Add Treatment
                </button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Treatment ID</th>
                    <th>Treatment Name</th>
                    <th>Duration</th>
                    <th>Default Sessions</th>
                    <th>Price</th>
                    <th>Status</th>
                    {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                      <th style={{ textAlign: "right" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((t, idx) => (
                    <tr key={t.treatmentId || idx}>
                      <td style={{ fontWeight: 600 }}>{t.treatmentId}</td>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>⏱️ {t.duration} mins</td>
                      <td>🔢 {t.sessions || 1} session</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(t.price)}</td>
                      <td>
                        <span className="badge-pill" style={{ background: t.status === "Active" ? "#dcfce7" : "#fee2e2", color: t.status === "Active" ? "#166534" : "#991b1b" }}>
                          {t.status}
                        </span>
                      </td>
                      {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => {
                                setEditingTreatmentIndex(idx)
                                setTreatmentName(t.name)
                                setTreatmentDuration(t.duration)
                                setTreatmentSessions(t.sessions || 1)
                                setTreatmentPrice(t.price || 0)
                                setTreatmentStatus(t.status)
                                setShowTreatmentForm(true)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={t.status === "Active" ? "btn-danger" : "btn-secondary"}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => {
                                const updated = [...treatments]
                                updated[idx] = { ...t, status: t.status === "Active" ? "Inactive" : "Active" }
                                setTreatments(updated)
                              }}
                            >
                              {t.status === "Active" ? "Disable" : "Activate"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================
            ROOMS TAB
        ====================================================== */}
        {activeSection === "Clinic" && ["Admin", "Manager", "Owner"].includes(currentUser?.role) && clinicSettingsTab === "Rooms" && (
          <div className="content-card">
            <div className="content-header">
              <h2>Treatment Rooms & Suites</h2>
              {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                <button
                  className="btn-primary-cta"
                  onClick={() => {
                    resetRoomForm()
                    setShowRoomForm(true)
                  }}
                >
                  + Add Room
                </button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room ID</th>
                    <th>Room Name</th>
                    <th>Status</th>
                    {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                      <th style={{ textAlign: "right" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r, idx) => (
                    <tr key={r.roomId || idx}>
                      <td style={{ fontWeight: 600 }}>{r.roomId}</td>
                      <td style={{ fontWeight: 600 }}>🚪 {r.name}</td>
                      <td>
                        <span className="badge-pill" style={{ background: r.status === "Active" ? "#dcfce7" : "#fee2e2", color: r.status === "Active" ? "#166534" : "#991b1b" }}>
                          {r.status}
                        </span>
                      </td>
                      {["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => {
                                setEditingRoomId(r.roomId)
                                setRoomName(r.name)
                                setRoomStatus(r.status)
                                setShowRoomForm(true)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={r.status === "Active" ? "btn-danger" : "btn-secondary"}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => {
                                const updated = [...rooms]
                                updated[idx] = { ...r, status: r.status === "Active" ? "Inactive" : "Active" }
                                setRooms(updated)
                              }}
                            >
                              {r.status === "Active" ? "Disable" : "Activate"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================
            CLINIC SETTINGS TAB (ADMIN ONLY)
        ====================================================== */}
        {activeSection === "Clinic" && ["Admin", "Manager", "Owner"].includes(currentUser?.role) && (
          <div className="content-card" style={{ maxWidth: "700px" }}>
            <div className="content-header">
              <h2>Clinic Profile & Settings</h2>
              <button
                className="btn-primary-cta"
                onClick={() => {
                  setClinicName(clinic.name)
                  setClinicPhone(clinic.phone)
                  setClinicAddress(clinic.address)
                  setClinicOpeningTime(clinic.openingTime)
                  setClinicClosingTime(clinic.closingTime)
                  setShowClinicForm(true)
                }}
              >
                ✏️ Edit Settings
              </button>
            </div>

            <div className="status-filter-pills" style={{ marginBottom: "20px" }}>
              {["Staff", "Treatments", "Rooms"].map((tab) => (
                <button
                  key={tab}
                  className={`filter-pill-btn ${clinicSettingsTab === tab ? "active" : ""}`}
                  onClick={() => setClinicSettingsTab(tab)}
                >
                  {tab === "Staff" ? `👥 Staff (${staff.length})` : tab === "Treatments" ? `💉 Treatments (${treatments.length})` : `🚪 Rooms (${rooms.length})`}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="inspector-row">
                <span className="label">Clinic ID</span>
                <span className="val">{clinic.clinicId}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Clinic Name</span>
                <span className="val">{clinic.name}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Phone</span>
                <span className="val">{clinic.phone || "Not set"}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Address</span>
                <span className="val">{clinic.address || "Not set"}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Opening Time</span>
                <span className="val">{clinic.openingTime}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Closing Time</span>
                <span className="val">{clinic.closingTime}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {showProfile && (
        <div className="modal-backdrop" onClick={() => setShowProfile(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>My Profile</h2>
              <button className="btn-close-modal" onClick={() => setShowProfile(false)}>✕</button>
            </div>

            <div className="inspector-section">
              <div className="inspector-row">
                <span className="label">Name</span>
                <span className="val">{currentUser?.name}</span>
              </div>
              <div className="inspector-row">
                <span className="label">User ID</span>
                <span className="val">{currentUser?.userId}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Role</span>
                <span className="val">{currentUser?.role}</span>
              </div>
            </div>

            <div className="inspector-section">
              <h3 style={{ marginTop: 0 }}>Appointment Incentive</h3>
              <div className="inspector-row">
                <span className="label">Your appointments</span>
                <span className="val">{profileIncentive.appointments}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Received cash</span>
                <span className="val">{formatCurrency(profileIncentive.receivedCash)}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Fully paid appointments</span>
                <span className="val">{profileIncentive.fullyPaid}</span>
              </div>
              <div className="inspector-row">
                <span className="label">Incentive earned ({incentiveRate}%)</span>
                <strong className="val" style={{ color: "#15803d" }}>{formatCurrency(profileIncentive.incentive)}</strong>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="form-control" value={profileCurrentPassword} onChange={(e) => setProfileCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={profileNewPassword} onChange={(e) => setProfileNewPassword(e.target.value)} minLength="6" required />
              </div>
              {profileMessage && <p style={{ color: profileMessage.includes("successfully") ? "#15803d" : "#dc2626", fontSize: "13px" }}>{profileMessage}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowProfile(false)}>Close</button>
                <button type="submit" className="btn-primary-cta">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: NEW / EDIT APPOINTMENT FORM
      ====================================================== */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIndex !== null ? "Reschedule Appointment" : "New Patient Booking"}</h2>
              <button className="btn-close-modal" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sarah Khan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 03001234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Treatment *</label>
                <select
                  className="form-control"
                  value={treatment}
                  onChange={(e) => {
                    const sel = e.target.value
                    setTreatment(sel)
                    const dur = getTreatmentDuration(sel)
                    const sess = getTreatmentSessions(sel)
                    const pr = getTreatmentPrice(sel)
                    setAppointmentSessions(sess)
                    setAppointmentPrice(pr)
                    if (appointmentDate) {
                      const autoTime = findFirstAvailableTime(appointmentDate, dur)
                      if (autoTime) setAppointmentTime(autoTime)
                    }
                  }}
                  required
                >
                  <option value="">Select Treatment</option>
                  {treatments.filter((t) => t.status === "Active").map((t) => (
                    <option key={t.treatmentId} value={t.name}>
                      {t.name} ({t.duration}m - Rs. {t.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Number of Sessions *</label>
                <input
                  type="number"
                  className="form-control"
                  value={appointmentSessions}
                  onChange={(e) => setAppointmentSessions(Math.max(1, Number(e.target.value) || 1))}
                  min="1"
                  disabled={packagePriceLocked}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={appointmentDate}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value)
                      if (treatment) {
                        const dur = getTreatmentDuration(treatment)
                        const autoTime = findFirstAvailableTime(e.target.value, dur)
                        if (autoTime) setAppointmentTime(autoTime)
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {appointmentTime && treatment && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px" }}>
                  ⏰ Estimated End Time: <strong>{calculateEndTime(appointmentTime, getTreatmentDuration(treatment))}</strong> ({getTreatmentDuration(treatment)} mins)
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Package Price (Rs.)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={appointmentPrice}
                    onChange={(e) => setAppointmentPrice(e.target.value)}
                    min="0"
                    disabled={packagePriceLocked}
                  />
                </div>

                <div className="form-group">
                  <label>Advance Paid (Rs.)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    min="0"
                    disabled={paidAmountLocked}
                  />
                </div>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "14px" }}>
                Remaining Balance Due: <span style={{ color: "#dc2626" }}>{formatCurrency(calculateBalance(appointmentPrice, paidAmount))}</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary-cta">
                  {editingHistoryIndex !== null ? "Book Next Session" : editingIndex !== null ? "Save Rescheduled Booking" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: ASSIGN ROOM & THERAPIST
      ====================================================== */}
      {showAssignModal && assigningAppointmentIndex !== null && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Room & Specialist</h2>
              <button className="btn-close-modal" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Select Room *</label>
              <select
                className="form-control"
                value={assignedRoom}
                onChange={(e) => setAssignedRoom(e.target.value)}
              >
                <option value="">Select Room</option>
                {rooms.filter((r) => r.status === "Active").map((r) => (
                  <option key={r.roomId} value={r.roomId}>🚪 {r.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Specialist (On-Duty) *</label>
              <select
                className="form-control"
                value={assignedTherapist}
                onChange={(e) => setAssignedTherapist(e.target.value)}
              >
                <option value="">Select Therapist</option>
                {getAvailableTherapists().map((s) => (
                  <option key={s.userId} value={s.userId}>👤 {s.name} ({s.userId})</option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn-primary-cta"
                onClick={() => handleAssignTreatment(assigningAppointmentIndex)}
              >
                Start Treatment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: STAFF FORM
      ====================================================== */}
      {showStaffForm && (
        <div className="modal-backdrop" onClick={() => setShowStaffForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStaffIndex !== null ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button className="btn-close-modal" onClick={() => setShowStaffForm(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (!staffName || !staffPassword) {
                alert("Please enter both name and password.")
                return
              }
              if (editingStaffIndex !== null) {
                const updated = [...staff]
                updated[editingStaffIndex] = {
                  ...updated[editingStaffIndex],
                  name: staffName,
                  password: staffPassword,
                  role: staffRole,
                  status: staffStatus,
                }
                setStaff(updated)
                resetStaffForm()
                return
              }
              const padded = String(nextStaffNumber).padStart(3, "0")
              const newId = `SA${padded}`
              setStaff([...staff, { clinicId, userId: newId, name: staffName, password: staffPassword, role: staffRole, status: staffStatus }])
              setNextStaffNumber((curr) => Number(curr) + 1)
              resetStaffForm()
            }}>
              <div className="form-group">
                <label>Staff Full Name *</label>
                <input type="text" className="form-control" value={staffName} onChange={(e) => setStaffName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" className="form-control" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-control" value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                    <option value="Operator">Operator</option>
                    <option value="Therapist">Therapist</option>
                    <option value="Manager">Manager</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={staffStatus} onChange={(e) => setStaffStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowStaffForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary-cta">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: TREATMENT FORM
      ====================================================== */}
      {showTreatmentForm && (
        <div className="modal-backdrop" onClick={() => setShowTreatmentForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTreatmentIndex !== null ? "Edit Treatment" : "Add Treatment"}</h2>
              <button className="btn-close-modal" onClick={() => setShowTreatmentForm(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (!treatmentName || !treatmentDuration) {
                alert("Please enter name and duration.")
                return
              }
              if (Number(treatmentPrice) < 0) {
                alert("Price cannot be negative.")
                return
              }
              if (editingTreatmentIndex !== null) {
                const updated = [...treatments]
                updated[editingTreatmentIndex] = {
                  ...updated[editingTreatmentIndex],
                  name: treatmentName,
                  duration: Number(treatmentDuration),
                  sessions: Number(treatmentSessions) || 1,
                  price: Number(treatmentPrice) || 0,
                  status: treatmentStatus,
                }
                setTreatments(updated)
                resetTreatmentForm()
                return
              }
              const padded = String(nextTreatmentNumber).padStart(3, "0")
              const newId = `TR${padded}`
              setTreatments([...treatments, { clinicId, treatmentId: newId, name: treatmentName, duration: Number(treatmentDuration), sessions: Number(treatmentSessions) || 1, price: Number(treatmentPrice) || 0, status: treatmentStatus }])
              setNextTreatmentNumber((curr) => Number(curr) + 1)
              resetTreatmentForm()
            }}>
              <div className="form-group">
                <label>Treatment Name *</label>
                <input type="text" className="form-control" value={treatmentName} onChange={(e) => setTreatmentName(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (Mins) *</label>
                  <input type="number" className="form-control" value={treatmentDuration} onChange={(e) => setTreatmentDuration(e.target.value)} required min="5" />
                </div>
                <div className="form-group">
                  <label>Default Sessions</label>
                  <input type="number" className="form-control" value={treatmentSessions} onChange={(e) => setTreatmentSessions(e.target.value)} min="1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Default Price (Rs.)</label>
                  <input type="number" className="form-control" value={treatmentPrice} onChange={(e) => setTreatmentPrice(e.target.value)} min="0" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={treatmentStatus} onChange={(e) => setTreatmentStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowTreatmentForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary-cta">Save Treatment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: ROOM FORM
      ====================================================== */}
      {showRoomForm && (
        <div className="modal-backdrop" onClick={() => setShowRoomForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoomId !== null ? "Edit Room" : "Add Room"}</h2>
              <button className="btn-close-modal" onClick={() => setShowRoomForm(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (!roomName) {
                alert("Please enter room name.")
                return
              }
              if (editingRoomId !== null) {
                setRooms(rooms.map((r) => (r.roomId === editingRoomId ? { ...r, name: roomName, status: roomStatus } : r)))
                resetRoomForm()
                return
              }
              const nextNum = rooms.length + 1
              const padded = String(nextNum).padStart(3, "0")
              const newId = `RM${padded}`
              setRooms([...rooms, { clinicId, roomId: newId, name: roomName, status: roomStatus }])
              resetRoomForm()
            }}>
              <div className="form-group">
                <label>Room Name *</label>
                <input type="text" className="form-control" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowRoomForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary-cta">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: CLINIC FORM
      ====================================================== */}
      {showClinicForm && (
        <div className="modal-backdrop" onClick={() => setShowClinicForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Clinic Information</h2>
              <button className="btn-close-modal" onClick={() => setShowClinicForm(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              setClinic({
                ...clinic,
                name: clinicName,
                phone: clinicPhone,
                address: clinicAddress,
                openingTime: clinicOpeningTime,
                closingTime: clinicClosingTime,
              })
              setShowClinicForm(false)
            }}>
              <div className="form-group">
                <label>Clinic Name</label>
                <input type="text" className="form-control" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="form-control" value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" className="form-control" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input type="time" className="form-control" value={clinicOpeningTime} onChange={(e) => setClinicOpeningTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Closing Time</label>
                  <input type="time" className="form-control" value={clinicClosingTime} onChange={(e) => setClinicClosingTime(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowClinicForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary-cta">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
