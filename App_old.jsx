import { useEffect, useState } from "react"

function App() {
  // ============================================================
  // CLINIC
  // ============================================================

  const clinicId = "SA1"
  const currentYear = new Date().getFullYear().toString().slice(-2)

  const [clinic, setClinic] = useState(() => {
    const savedClinic = localStorage.getItem("clinic")
    return savedClinic
      ? JSON.parse(savedClinic)
      : {
          clinicId: "SA1",
          name: "Sarte Aesthetic Clinic",
          phone: "",
          address: "",
          openingTime: "13:30",
          closingTime: "21:00",
        }
  })

  useEffect(() => {
    localStorage.setItem("clinic", JSON.stringify(clinic))
  }, [clinic])

  // ============================================================
  // LOGIN
  // ============================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeSection, setActiveSection] = useState("Appointments")

  // ============================================================
  // ACTIVE STAFF
  // ============================================================

  const [activeStaff, setActiveStaff] = useState(() => {
    const saved = localStorage.getItem("activeStaff")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("activeStaff", JSON.stringify(activeStaff))
  }, [activeStaff])

  // ============================================================
  // STAFF
  // ============================================================

  const [staff, setStaff] = useState(() => {
    const savedStaff = localStorage.getItem("staff")

    if (savedStaff) {
      const parsedStaff = JSON.parse(savedStaff)
      return parsedStaff.map((member) => ({
        ...member,
        clinicId: member.clinicId || "SA1",
      }))
    }

    return []
  })

  const [nextStaffNumber, setNextStaffNumber] = useState(() => {
    const saved = localStorage.getItem("nextStaffNumber")
    return saved ? Number(saved) : 1
  })

  useEffect(() => {
    localStorage.setItem("staff", JSON.stringify(staff))
  }, [staff])

  useEffect(() => {
    localStorage.setItem("nextStaffNumber", nextStaffNumber)
  }, [nextStaffNumber])

  const [showStaffForm, setShowStaffForm] = useState(false)
  const [staffName, setStaffName] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const [staffRole, setStaffRole] = useState("Operator")
  const [staffStatus, setStaffStatus] = useState("Active")
  const [editingStaffIndex, setEditingStaffIndex] = useState(null)

  // ============================================================
  // THERAPIST AVAILABILITY
  // ============================================================

  const [therapistAvailability, setTherapistAvailability] = useState(() => {
    const saved = localStorage.getItem("therapistAvailability")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(
      "therapistAvailability",
      JSON.stringify(therapistAvailability)
    )
  }, [therapistAvailability])

  // ============================================================
  // TREATMENTS
  // ============================================================

  const [treatments, setTreatments] = useState(() => {
    const saved = localStorage.getItem("treatments")

    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((item) => ({
        ...item,
        clinicId: item.clinicId || "SA1",
        sessions: Number(item.sessions) || 1,
        price: Number(item.price) || 0,
      }))
    }

    return [
      {
        clinicId: "SA1",
        treatmentId: "TR001",
        name: "Hydra Facial",
        duration: 45,
        sessions: 1,
        price: 0,
        status: "Active",
      },
      {
        clinicId: "SA1",
        treatmentId: "TR002",
        name: "Chemical Peel",
        duration: 20,
        sessions: 1,
        price: 0,
        status: "Active",
      },
      {
        clinicId: "SA1",
        treatmentId: "TR003",
        name: "Laser Hair Removal",
        duration: 30,
        sessions: 1,
        price: 0,
        status: "Active",
      },
      {
        clinicId: "SA1",
        treatmentId: "TR004",
        name: "Skin Consultation",
        duration: 30,
        sessions: 1,
        price: 0,
        status: "Active",
      },
    ]
  })

  const [nextTreatmentNumber, setNextTreatmentNumber] = useState(() => {
    const saved = localStorage.getItem("nextTreatmentNumber")
    return saved ? Number(saved) : 5
  })

  const [treatmentHistory, setTreatmentHistory] = useState(() => {
    const saved = localStorage.getItem("treatmentHistory")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("treatments", JSON.stringify(treatments))
  }, [treatments])

  useEffect(() => {
    localStorage.setItem("nextTreatmentNumber", nextTreatmentNumber)
  }, [nextTreatmentNumber])

  useEffect(() => {
    localStorage.setItem(
      "treatmentHistory",
      JSON.stringify(treatmentHistory)
    )
  }, [treatmentHistory])

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

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("rooms")

    if (saved) {
      return JSON.parse(saved)
    }

    return [
      {
        clinicId: "SA1",
        roomId: "RM001",
        name: "Room 1",
        status: "Active",
      },
      {
        clinicId: "SA1",
        roomId: "RM002",
        name: "Room 2",
        status: "Active",
      },
      {
        clinicId: "SA1",
        roomId: "RM003",
        name: "Room 3",
        status: "Active",
      },
    ]
  })

  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms))
  }, [rooms])

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

  // ============================================================
  // APPOINTMENTS
  // ============================================================

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem("appointments")
    return saved ? JSON.parse(saved) : []
  })

  const [appointmentHistory, setAppointmentHistory] = useState(() => {
    const saved = localStorage.getItem("appointmentHistory")
    return saved ? JSON.parse(saved) : []
  })

  // ============================================================
  // INTERNAL APPOINTMENT ACTIVITY LOG
  // ============================================================

  const [appointmentActivities, setAppointmentActivities] = useState(() => {
    const saved = localStorage.getItem("appointmentActivities")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(
      "appointmentActivities",
      JSON.stringify(appointmentActivities)
    )
  }, [appointmentActivities])

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

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    localStorage.setItem(
      "appointmentHistory",
      JSON.stringify(appointmentHistory)
    )
  }, [appointmentHistory])

  // ============================================================
  // RECEIPTS
  // ============================================================

  const [nextReceiptNumber, setNextReceiptNumber] = useState(() => {
    const saved = localStorage.getItem(
      `nextReceiptNumber_${clinicId}_${currentYear}`
    )
    return saved ? Number(saved) : 1
  })

  useEffect(() => {
    localStorage.setItem(
      `nextReceiptNumber_${clinicId}_${currentYear}`,
      nextReceiptNumber
    )
  }, [nextReceiptNumber, clinicId, currentYear])

  // ============================================================
  // APPOINTMENT FORM
  // ============================================================

  const [showForm, setShowForm] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [treatment, setTreatment] = useState("")
  const [appointmentSessions, setAppointmentSessions] = useState(1)
  const [appointmentPrice, setAppointmentPrice] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [editingIndex, setEditingIndex] = useState(null)

  // ============================================================
  // TREATMENT ASSIGNMENT
  // ============================================================

  const [assigningAppointmentIndex, setAssigningAppointmentIndex] =
    useState(null)
  const [assignedRoom, setAssignedRoom] = useState("")
  const [assignedTherapist, setAssignedTherapist] = useState("")

  const [treatmentAssignments, setTreatmentAssignments] = useState(() => {
    const saved = localStorage.getItem("treatmentAssignments")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(
      "treatmentAssignments",
      JSON.stringify(treatmentAssignments)
    )
  }, [treatmentAssignments])

  // ============================================================
  // DATE
  // ============================================================

  const today = new Date().toLocaleDateString("en-CA")
  const [selectedDate, setSelectedDate] = useState(today)

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getTreatment = (treatmentNameValue) => {
    return treatments.find(
      (item) =>
        item.clinicId === clinicId &&
        item.name === treatmentNameValue &&
        item.status === "Active"
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

  const calculateBalance = (price, paid) => {
    return Math.max(0, Number(price || 0) - Number(paid || 0))
  }

  const getAvailableTherapists = () => {
    return staff.filter((member) => {
      if (
        member.clinicId !== clinicId ||
        member.role !== "Therapist" ||
        member.status !== "Active"
      ) {
        return false
      }

      const loggedIn = activeStaff.some(
        (active) => active.userId === member.userId
      )

      if (!loggedIn) {
        return false
      }

      const alreadyTreating = appointments.some(
        (appointment) =>
          appointment.therapist === member.userId &&
          appointment.status === "In Treatment"
      )

      return !alreadyTreating
    })
  }

  const findFirstAvailableTime = (date, duration = 30) => {
    if (!date) {
      return ""
    }

    const [openingHour, openingMinute] =
      clinic.openingTime.split(":").map(Number)
    const [closingHour, closingMinute] =
      clinic.closingTime.split(":").map(Number)

    const openingMinutes = openingHour * 60 + openingMinute
    const closingMinutes = closingHour * 60 + closingMinute

    const activeRooms = rooms.filter(
      (room) =>
        room.clinicId === clinicId &&
        room.status === "Active"
    )

    if (activeRooms.length === 0) {
      return ""
    }

    for (
      let totalMinutes = openingMinutes;
      totalMinutes < closingMinutes;
      totalMinutes += 15
    ) {
      const appointmentEndMinutes = totalMinutes + Number(duration)

      if (appointmentEndMinutes > closingMinutes) {
        continue
      }

      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60

      const time =
        `${String(hour).padStart(2, "0")}:` +
        `${String(minute).padStart(2, "0")}`

      const start = new Date(`${date}T${time}:00`)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + Number(duration))

      const roomAvailable = activeRooms.some((room) => {
        return !appointments.some((appointment, appointmentIndex) => {
          if (
            editingIndex !== null &&
            appointmentIndex === editingIndex
          ) {
            return false
          }

          if (
            appointment.room !== room.roomId ||
            appointment.appointmentDate !== date
          ) {
            return false
          }

          if (
            appointment.status === "Cancelled" ||
            appointment.status === "No Show"
          ) {
            return false
          }

          if (!appointment.appointmentTime || !appointment.endTime) {
            return false
          }

          const existingStart = new Date(
            `${appointment.appointmentDate}T${appointment.appointmentTime}:00`
          )
          const existingEnd = new Date(
            `${appointment.appointmentDate}T${appointment.endTime}:00`
          )

          return existingStart < end && existingEnd > start
        })
      })

      if (roomAvailable) {
        return time
      }
    }

    return ""
  }

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) {
      return ""
    }

    const start = new Date(`1970-01-01T${startTime}:00`)
    start.setMinutes(start.getMinutes() + Number(duration))
    return start.toTimeString().slice(0, 5)
  }

  const resetAppointmentForm = () => {
    setCustomerName("")
    setPhoneNumber("")
    setAppointmentDate("")
    setAppointmentTime("")
    setTreatment("")
    setAppointmentSessions(1)
    setAppointmentPrice(0)
    setPaidAmount(0)
    setEditingIndex(null)
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

  const openNewAppointmentForm = () => {
    const firstTime = findFirstAvailableTime(today, 30)

    setEditingIndex(null)
    setCustomerName("")
    setPhoneNumber("")
    setTreatment("")
    setAppointmentSessions(1)
    setAppointmentPrice(0)
    setPaidAmount(0)
    setAppointmentDate(today)
    setAppointmentTime(firstTime)
    setShowForm(true)
  }

  const openRescheduleForm = (appointment, index) => {
    setEditingIndex(index)
    setCustomerName(appointment.customerName || "")
    setPhoneNumber(appointment.phoneNumber || "")
    setAppointmentDate(appointment.appointmentDate || "")
    setAppointmentTime(appointment.appointmentTime || "")
    setTreatment(appointment.treatment || "")
    setAppointmentSessions(
      Number(appointment.sessions) || getTreatmentSessions(appointment.treatment)
    )
    setAppointmentPrice(
      Number(appointment.packagePrice) || getTreatmentPrice(appointment.treatment)
    )
    setPaidAmount(Number(appointment.paidAmount) || 0)
    setShowForm(true)
  }

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = () => {
    const staffMember = staff.find(
      (member) =>
        member.clinicId === clinicId &&
        member.userId === username &&
        member.password === password &&
        member.status === "Active"
    )

    if (username === "admin" && password === "admin123") {
      const adminUser = {
        clinicId,
        userId: "ADMIN",
        name: "Administrator",
        username: "admin",
        role: "Admin",
      }

      setCurrentUser(adminUser)
      setIsLoggedIn(true)
      return
    }

    if (staffMember) {
      setCurrentUser(staffMember)
      setIsLoggedIn(true)

      setActiveStaff((current) => {
        const alreadyActive = current.some(
          (member) => member.userId === staffMember.userId
        )

        if (alreadyActive) {
          return current
        }

        return [
          ...current,
          {
            clinicId,
            userId: staffMember.userId,
            name: staffMember.name,
            role: staffMember.role,
            loggedInAt: Date.now(),
            activeSince: Date.now(),
          },
        ]
      })

      return
    }

    alert("Invalid username or password.")
  }

  const handleLogout = () => {
    if (currentUser && currentUser.role !== "Admin") {
      setActiveStaff((current) =>
        current.filter(
          (member) => member.userId !== currentUser.userId
        )
      )
    }

    setCurrentUser(null)
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
  }

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!isLoggedIn) {
    return (
      <div>
        <h1>{clinic.name}</h1>
        <h2>Operator Login</h2>

        <input
          type="text"
          placeholder="User ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={handleLogin}>Login</button>
      </div>
    )
  }

  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <div>
      <h1>{clinic.name}</h1>
      <h2>Appointment & Booking System</h2>

      <p>
        Logged in as: <strong>{currentUser?.name}</strong>
        {" - "}
        {currentUser?.role}
      </p>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <div>
        <button onClick={() => setActiveSection("Appointments")}>
          Appointments
        </button>

        <button onClick={() => setActiveSection("History")}>
          History
        </button>

        <button onClick={() => setActiveSection("Staff")}>
          Staff
        </button>

        <button onClick={() => setActiveSection("Treatments")}>
          Treatments
        </button>

        <button onClick={() => setActiveSection("Rooms")}>
          Rooms
        </button>

        {currentUser?.role === "Admin" && (
          <button onClick={() => setActiveSection("Clinic")}>
            Clinic
          </button>
        )}
      </div>

      <hr />

      {/* ======================================================
          APPOINTMENTS
      ====================================================== */}

      {activeSection === "Appointments" && (
        <div>
          <h3>Appointments</h3>

          <label>
            Select Date:{" "}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>

          <br />
          <br />

          {appointments
            .map((appointment, index) => ({
              appointment,
              index,
            }))
            .filter(
              ({ appointment }) =>
                appointment.appointmentDate === selectedDate
            )
            .map(({ appointment, index }) => (
              <div key={appointment.appointmentId || index}>
                <p>
                  <strong>{appointment.customerName}</strong>
                  {" - "}
                  {appointment.treatment}
                </p>

                <p>Status: {appointment.status}</p>

                <p>
                  Receipt ID:{" "}
                  <strong>{appointment.receiptId}</strong>
                </p>

                <p>
                  {appointment.phoneNumber}
                  {" - "}
                  {appointment.appointmentDate}
                  {" - "}
                  {appointment.appointmentTime}
                  {" - "}
                  {appointment.endTime}
                  {" - "}
                  {appointment.duration} minutes
                </p>

                <p>
                  Sessions:{" "}
                  <strong>
                    {appointment.sessions || 1}
                  </strong>
                </p>

                <p>
                  Package(s) Price:{" "}
                  <strong>
                    {Number(appointment.packagePrice || 0).toFixed(2)}
                  </strong>
                </p>

                <p>
                  Paid Amount:{" "}
                  <strong>
                    {Number(appointment.paidAmount || 0).toFixed(2)}
                  </strong>
                </p>

                <p>
                  Balance:{" "}
                  <strong>
                    {Number(appointment.balance || 0).toFixed(2)}
                  </strong>
                </p>

                <p>
                  Room:{" "}
                  {rooms.find(
                    (room) => room.roomId === appointment.room
                  )?.name ||
                    appointment.room ||
                    "Not assigned"}
                </p>

                <p>
                  Therapist:{" "}
                  {staff.find(
                    (member) => member.userId === appointment.therapist
                  )?.name ||
                    appointment.therapist ||
                    "Not assigned"}
                </p>

                {appointment.bookedBy && (
                  <p>
                    Booked By:{" "}
                    <strong>{appointment.bookedBy.name}</strong>
                  </p>
                )}

                {appointment.rescheduledBy && (
                  <p>
                    Rescheduled By:{" "}
                    <strong>{appointment.rescheduledBy.name}</strong>
                  </p>
                )}

                {appointment.assignedBy && (
                  <p>
                    Assigned By:{" "}
                    <strong>{appointment.assignedBy.name}</strong>
                  </p>
                )}

                {/* ASSIGN TREATMENT */}

                {appointment.status === "Arrived" && (
                  <button
                    onClick={() => {
                      setAssigningAppointmentIndex(index)

                      const availableRoom = rooms
                        .filter(
                          (room) =>
                            room.clinicId === clinicId &&
                            room.status === "Active"
                        )
                        .find((room) => {
                          return !appointments.some(
                            (otherAppointment, otherIndex) =>
                              otherIndex !== index &&
                              otherAppointment.room === room.roomId &&
                              otherAppointment.status === "In Treatment"
                          )
                        })

                      const availableTherapist = getAvailableTherapists()
                        .sort((a, b) => {
                          const aActive = activeStaff.find(
                            (active) => active.userId === a.userId
                          )
                          const bActive = activeStaff.find(
                            (active) => active.userId === b.userId
                          )

                          return (
                            (aActive?.activeSince || Infinity) -
                            (bActive?.activeSince || Infinity)
                          )
                        })[0]

                      setAssignedRoom(
                        availableRoom ? availableRoom.roomId : ""
                      )
                      setAssignedTherapist(
                        availableTherapist
                          ? availableTherapist.userId
                          : ""
                      )
                    }}
                  >
                    Assign
                  </button>
                )}

                {assigningAppointmentIndex === index && (
                  <div>
                    <h4>Assign Treatment</h4>

                    <p>
                      Customer:{" "}
                      <strong>{appointment.customerName}</strong>
                    </p>

                    <p>
                      Treatment:{" "}
                      <strong>{appointment.treatment}</strong>
                    </p>

                    <label>
                      Room:{" "}
                      <select
                        value={assignedRoom}
                        onChange={(e) =>
                          setAssignedRoom(e.target.value)
                        }
                      >
                        <option value="">Select Room</option>

                        {rooms
                          .filter(
                            (room) =>
                              room.clinicId === clinicId &&
                              room.status === "Active"
                          )
                          .map((room) => (
                            <option
                              key={room.roomId}
                              value={room.roomId}
                            >
                              {room.name}
                            </option>
                          ))}
                      </select>
                    </label>

                    <br />
                    <br />

                    <label>
                      Therapist:{" "}
                      <select
                        value={assignedTherapist}
                        onChange={(e) =>
                          setAssignedTherapist(e.target.value)
                        }
                      >
                        <option value="">Select Therapist</option>

                        {getAvailableTherapists().map((therapist) => (
                          <option
                            key={therapist.userId}
                            value={therapist.userId}
                          >
                            {therapist.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <br />
                    <br />

                    <button
                      onClick={() => {
                        if (!assignedRoom || !assignedTherapist) {
                          alert(
                            "Please select both Room and Therapist."
                          )
                          return
                        }

                        const roomBusy = appointments.some(
                          (item, itemIndex) =>
                            itemIndex !== index &&
                            item.room === assignedRoom &&
                            item.status === "In Treatment"
                        )

                        if (roomBusy) {
                          alert("This room is already in use.")
                          return
                        }

                        const therapistBusy = appointments.some(
                          (item, itemIndex) =>
                            itemIndex !== index &&
                            item.therapist === assignedTherapist &&
                            item.status === "In Treatment"
                        )

                        if (therapistBusy) {
                          alert(
                            "This therapist is already treating another customer."
                          )
                          return
                        }

                        const updatedAppointments = [...appointments]

                        const updatedAppointment = {
                          ...updatedAppointments[index],
                          room: assignedRoom,
                          therapist: assignedTherapist,
                          status: "In Treatment",
                          treatmentStartedAt: Date.now(),
                          assignedBy: {
                            clinicId,
                            userId:
                              currentUser?.userId || username,
                            name:
                              currentUser?.name || username,
                          },
                        }

                        updatedAppointments[index] =
                          updatedAppointment

                        setAppointments(updatedAppointments)

                        setTreatmentAssignments((current) => [
                          ...current,
                          {
                            clinicId,
                            appointmentId:
                              updatedAppointment.appointmentId || "",
                            receiptId:
                              updatedAppointment.receiptId || "",
                            room: assignedRoom,
                            therapist: assignedTherapist,
                            assignedBy: {
                              userId:
                                currentUser?.userId || username,
                              name:
                                currentUser?.name || username,
                            },
                            assignedAt: Date.now(),
                          },
                        ])

                        logAppointmentActivity(
                          updatedAppointment,
                          "Assigned",
                          {
                            room: assignedRoom,
                            therapist: assignedTherapist,
                          }
                        )

                        setAssigningAppointmentIndex(null)
                        setAssignedRoom("")
                        setAssignedTherapist("")
                      }}
                    >
                      Assign
                    </button>{" "}

                    <button
                      onClick={() => {
                        setAssigningAppointmentIndex(null)
                        setAssignedRoom("")
                        setAssignedTherapist("")
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* STATUS */}

                <label>
                  Status:{" "}
                  <select
                    value={appointment.status}
                    onChange={(e) => {
                      const newStatus = e.target.value

                      if (
                        newStatus === "Booked" ||
                        newStatus === "Arrived" ||
                        newStatus === "In Treatment"
                      ) {
                        const updatedAppointment = {
                          ...appointment,
                          status: newStatus,
                        }

                        const updatedAppointments = [...appointments]
                        updatedAppointments[index] =
                          updatedAppointment

                        setAppointments(updatedAppointments)

                        logAppointmentActivity(
                          updatedAppointment,
                          newStatus,
                          {
                            previousStatus: appointment.status,
                            newStatus,
                          }
                        )
                      } else {
                        const historyRecord = {
                          ...appointment,
                          clinicId:
                            appointment.clinicId || clinicId,
                          status: newStatus,
                          historyStatus: newStatus,
                          historyAt: Date.now(),
                        }

                        logAppointmentActivity(
                          appointment,
                          newStatus,
                          {
                            previousStatus: appointment.status,
                            newStatus,
                          }
                        )

                        setAppointmentHistory((current) => [
                          ...current,
                          historyRecord,
                        ])

                        setAppointments((current) =>
                          current.filter(
                            (_, appointmentIndex) =>
                              appointmentIndex !== index
                          )
                        )
                      }
                    }}
                  >
                    <option value="Booked">Booked</option>
                    <option value="Arrived">Arrived</option>
                    <option value="In Treatment">
                      In Treatment
                    </option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                  </select>
                </label>

                <br />
                <br />

                {/* RESCHEDULE */}

                <button
                  onClick={() =>
                    openRescheduleForm(appointment, index)
                  }
                >
                  Reschedule
                </button>{" "}

                {/* RECEIPT / WHATSAPP */}

                <button
                  onClick={() => {
                    const message =
                      `${clinic.name}\n\n` +
                      `APPOINTMENT RECEIPT\n` +
                      `=========================\n` +
                      `Receipt ID: ${appointment.receiptId}\n\n` +
                      `Customer: ${appointment.customerName}\n` +
                      `Treatment: ${appointment.treatment}\n` +
                      `Sessions: ${appointment.sessions || 1}\n` +
                      `Date: ${appointment.appointmentDate}\n` +
                      `Time: ${appointment.appointmentTime}\n` +
                      `Duration: ${appointment.duration} minutes\n` +
                      `Package(s) Price: ${Number(
                        appointment.packagePrice || 0
                      ).toFixed(2)}\n` +
                      `Paid Amount: ${Number(
                        appointment.paidAmount || 0
                      ).toFixed(2)}\n` +
                      `Balance: ${Number(
                        appointment.balance || 0
                      ).toFixed(2)}\n` +
                      `------------------------------\n` +
                      `Thank you for choosing\n` +
                      `${clinic.name}\n\n` +
                      `We look forward to seeing you!`

                    let whatsappNumber =
                      (appointment.phoneNumber || "").replace(
                        /\D/g,
                        ""
                      )

                    if (whatsappNumber.startsWith("03")) {
                      whatsappNumber =
                        "92" + whatsappNumber.substring(1)
                    }

                    const whatsappUrl =
                      `https://wa.me/${whatsappNumber}` +
                      `?text=${encodeURIComponent(message)}`

                    window.open(whatsappUrl, "_blank")
                  }}
                >
                  Send Receipt on WhatsApp
                </button>{" "}

                {/* DELETE */}

                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to delete this appointment?"
                    )

                    if (!confirmed) {
                      return
                    }

                    const deletedAppointment = appointments[index]

                    setAppointmentHistory((current) => [
                      ...current,
                      {
                        ...deletedAppointment,
                        historyStatus: "Deleted",
                        historyAt: Date.now(),
                      },
                    ])

                    logAppointmentActivity(
                      deletedAppointment,
                      "Deleted",
                      {}
                    )

                    setAppointments((current) =>
                      current.filter(
                        (_, appointmentIndex) =>
                          appointmentIndex !== index
                      )
                    )
                  }}
                >
                  Delete
                </button>

                <hr />
              </div>
            ))}

          <button onClick={openNewAppointmentForm}>
            New Appointment
          </button>

          {/* APPOINTMENT FORM */}

          {showForm && (
            <div>
              <hr />

              <h3>
                {editingIndex !== null
                  ? "Reschedule Appointment"
                  : "New Appointment"}
              </h3>

              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
              />

              <br />
              <br />

              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value)
                }
              />

              <br />
              <br />

              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  const newDate = e.target.value
                  setAppointmentDate(newDate)

                  setAppointmentTime(
                    findFirstAvailableTime(
                      newDate,
                      getTreatmentDuration(treatment) || 30
                    )
                  )
                }}
              />

              <br />
              <br />

              <select
                value={treatment}
                onChange={(e) => {
                  const newTreatment = e.target.value
                  setTreatment(newTreatment)

                  const duration =
                    getTreatmentDuration(newTreatment)

                  const sessions =
                    getTreatmentSessions(newTreatment)

                  const price =
                    getTreatmentPrice(newTreatment)

                  setAppointmentSessions(sessions)
                  setAppointmentPrice(price)

                  if (appointmentDate && duration) {
                    setAppointmentTime(
                      findFirstAvailableTime(
                        appointmentDate,
                        duration
                      )
                    )
                  }
                }}
              >
                <option value="">Select Treatment</option>

                {treatments
                  .filter(
                    (item) =>
                      item.clinicId === clinicId &&
                      item.status === "Active"
                  )
                  .map((item) => (
                    <option
                      key={item.treatmentId}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))}
              </select>

              <br />
              <br />

              {/* SESSIONS */}

              <label>
                Sessions:{" "}
                <select
                  value={appointmentSessions}
                  onChange={(e) =>
                    setAppointmentSessions(
                      Number(e.target.value)
                    )
                  }
                >
                  {Array.from(
                    {
                      length: Math.max(
                        1,
                        getTreatmentSessions(treatment)
                      ),
                    },
                    (_, index) => index + 1
                  ).map((sessionNumber) => (
                    <option
                      key={sessionNumber}
                      value={sessionNumber}
                    >
                      {sessionNumber}
                    </option>
                  ))}
                </select>
              </label>

              <br />
              <br />

              <label>
                Package(s) Price:{" "}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={appointmentPrice}
                  onChange={(e) =>
                    setAppointmentPrice(
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <br />
              <br />

              <label>
                Paid Amount:{" "}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <br />
              <br />

              <p>
                Balance:{" "}
                <strong>
                  {calculateBalance(
                    appointmentPrice,
                    paidAmount
                  ).toFixed(2)}
                </strong>
              </p>

              <input
                type="time"
                value={appointmentTime}
                onChange={(e) =>
                  setAppointmentTime(e.target.value)
                }
              />

              <br />
              <br />

              <button
                onClick={() => {
                  const duration =
                    getTreatmentDuration(treatment)

                  if (
                    !customerName ||
                    !phoneNumber ||
                    !appointmentDate ||
                    !appointmentTime ||
                    !treatment
                  ) {
                    alert(
                      "Please complete all appointment details."
                    )
                    return
                  }

                  if (!duration) {
                    alert(
                      "Please select a valid treatment."
                    )
                    return
                  }

                  if (!appointmentSessions || appointmentSessions < 1) {
                    alert("Please select the number of sessions.")
                    return
                  }

                  const phoneIsValid =
                    /^03\d+$/.test(phoneNumber) ||
                    /^\+\d+$/.test(phoneNumber)

                  if (!phoneIsValid) {
                    alert(
                      "Please enter a valid phone number."
                    )
                    return
                  }

                  const numericPrice = Number(
                    appointmentPrice || 0
                  )
                  const numericPaid = Number(
                    paidAmount || 0
                  )

                  if (numericPrice < 0 || numericPaid < 0) {
                    alert("Price and paid amount cannot be negative.")
                    return
                  }

                  const endTime = calculateEndTime(
                    appointmentTime,
                    duration
                  )

                  if (!endTime) {
                    alert(
                      "Unable to calculate appointment end time."
                    )
                    return
                  }

                  const newStart = new Date(
                    `${appointmentDate}T${appointmentTime}:00`
                  )

                  const newEnd = new Date(
                    `${appointmentDate}T${endTime}:00`
                  )

                  const availableRoom = rooms
                    .filter(
                      (room) =>
                        room.clinicId === clinicId &&
                        room.status === "Active"
                    )
                    .find((room) => {
                      return !appointments.some(
                        (
                          existingAppointment,
                          existingIndex
                        ) => {
                          if (
                            editingIndex !== null &&
                            existingIndex === editingIndex
                          ) {
                            return false
                          }

                          if (
                            existingAppointment.room !== room.roomId ||
                            existingAppointment.appointmentDate !==
                              appointmentDate
                          ) {
                            return false
                          }

                          if (
                            existingAppointment.status ===
                              "Cancelled" ||
                            existingAppointment.status ===
                              "No Show"
                          ) {
                            return false
                          }

                          if (
                            !existingAppointment.appointmentTime ||
                            !existingAppointment.endTime
                          ) {
                            return false
                          }

                          const existingStart = new Date(
                            `${existingAppointment.appointmentDate}T${existingAppointment.appointmentTime}:00`
                          )

                          const existingEnd = new Date(
                            `${existingAppointment.appointmentDate}T${existingAppointment.endTime}:00`
                          )

                          return (
                            existingStart < newEnd &&
                            existingEnd > newStart
                          )
                        }
                      )
                    })

                  if (!availableRoom) {
                    alert(
                      "All active treatment rooms are occupied at this time."
                    )
                    return
                  }

                  // RESCHEDULE:
                  // Update the SAME appointment record.
                  // The activity is stored separately and internally.

                  if (editingIndex !== null) {
                    const oldAppointment =
                      appointments[editingIndex]

                    logAppointmentActivity(
                      oldAppointment,
                      "Rescheduled",
                      {
                        oldDate:
                          oldAppointment.appointmentDate,
                        oldTime:
                          oldAppointment.appointmentTime,
                        oldEndTime:
                          oldAppointment.endTime,
                        newDate:
                          appointmentDate,
                        newTime:
                          appointmentTime,
                        newEndTime:
                          endTime,
                        oldRoom:
                          oldAppointment.room,
                        newRoom:
                          availableRoom.roomId,
                      }
                    )

                    const updatedAppointments = [
                      ...appointments,
                    ]

                    updatedAppointments[editingIndex] = {
                      ...oldAppointment,
                      customerName,
                      phoneNumber,
                      treatment,
                      duration,
                      sessions: Number(
                        appointmentSessions
                      ),
                      appointmentDate,
                      appointmentTime,
                      endTime,
                      room:
                        availableRoom.roomId,
                      packagePrice:
                        numericPrice,
                      paidAmount:
                        numericPaid,
                      balance:
                        calculateBalance(
                          numericPrice,
                          numericPaid
                        ),
                      status: "Booked",
                      rescheduledBy: {
                        clinicId,
                        userId:
                          currentUser?.userId ||
                          username,
                        name:
                          currentUser?.name ||
                          username,
                      },
                      rescheduledAt: Date.now(),
                    }

                    setAppointments(
                      updatedAppointments
                    )
                  } else {
                    // NEW APPOINTMENT

                    const receiptId =
                      clinicId +
                      currentYear +
                      String(
                        nextReceiptNumber
                      ).padStart(3, "0")

                    const newAppointment = {
                      clinicId,
                      appointmentId:
                        `APT${Date.now()}${Math.floor(
                          Math.random() * 1000
                        )}`,
                      receiptId,
                      customerName,
                      phoneNumber,
                      treatment,
                      duration,
                      sessions:
                        Number(appointmentSessions),
                      appointmentDate,
                      appointmentTime,
                      endTime,
                      room:
                        availableRoom.roomId,
                      status: "Booked",
                      packagePrice:
                        numericPrice,
                      paidAmount:
                        numericPaid,
                      balance:
                        calculateBalance(
                          numericPrice,
                          numericPaid
                        ),
                      bookedBy: {
                        clinicId,
                        userId:
                          currentUser?.userId ||
                          username,
                        name:
                          currentUser?.name ||
                          username,
                      },
                      bookedAt: Date.now(),
                    }

                    setAppointments((current) => [
                      ...current,
                      newAppointment,
                    ])

                    logAppointmentActivity(
                      newAppointment,
                      "Booked",
                      {
                        date: appointmentDate,
                        time: appointmentTime,
                        treatment,
                        duration,
                        sessions:
                          Number(
                            appointmentSessions
                          ),
                        packagePrice:
                          numericPrice,
                        paidAmount:
                          numericPaid,
                        balance:
                          calculateBalance(
                            numericPrice,
                            numericPaid
                          ),
                        room:
                          availableRoom.roomId,
                      }
                    )

                    setNextReceiptNumber(
                      (current) => current + 1
                    )
                  }

                  resetAppointmentForm()
                }}
              >
                {editingIndex !== null
                  ? "Save Rescheduled Appointment"
                  : "Save Appointment"}
              </button>{" "}

              <button onClick={resetAppointmentForm}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          HISTORY
      ====================================================== */}

      {activeSection === "History" && (
        <div>
          <h3>Appointment History</h3>

          {appointmentHistory.length === 0 ? (
            <p>No appointment history yet.</p>
          ) : (
            appointmentHistory
              .slice()
              .reverse()
              .map((appointment, historyIndex) => (
                <div
                  key={
                    appointment.appointmentId ||
                    `${appointment.receiptId}-${historyIndex}`
                  }
                >
                  <strong>
                    {appointment.customerName}
                    {" - "}
                    {appointment.treatment}
                  </strong>

                  <p>
                    Receipt ID:{" "}
                    <strong>
                      {appointment.receiptId}
                    </strong>
                  </p>

                  <p>
                    {appointment.appointmentDate}
                    {" - "}
                    {appointment.appointmentTime}
                    {" - "}
                    {appointment.duration} minutes
                  </p>

                  <p>
                    Sessions:{" "}
                    {appointment.sessions || 1}
                  </p>

                  <p>
                    Package(s) Price:{" "}
                    {Number(
                      appointment.packagePrice || 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    Paid Amount:{" "}
                    {Number(
                      appointment.paidAmount || 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    Balance:{" "}
                    {Number(
                      appointment.balance || 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    History Status:{" "}
                    {appointment.historyStatus}
                  </p>

                  <hr />
                </div>
              ))
          )}
        </div>
      )}

      {/* ======================================================
          STAFF
      ====================================================== */}

      {activeSection === "Staff" &&
        currentUser?.role === "Admin" && (
          <div>
            <h3>Staff Management</h3>

            {staff.filter(
              (member) => member.clinicId === clinicId
            ).length === 0 ? (
              <p>No staff added yet.</p>
            ) : (
              staff
                .filter(
                  (member) => member.clinicId === clinicId
                )
                .map((member) => (
                  <div key={member.userId}>
                    <strong>{member.name}</strong>

                    <p>
                      User ID: {member.userId}
                    </p>

                    <p>
                      Role: {member.role}
                    </p>

                    <p>
                      Status: {member.status}
                    </p>

                    <button
                      onClick={() => {
                        setEditingStaffIndex(
                          staff.findIndex(
                            (item) =>
                              item.userId ===
                              member.userId
                          )
                        )
                        setStaffName(member.name)
                        setStaffPassword(member.password)
                        setStaffRole(member.role)
                        setStaffStatus(
                          member.status || "Active"
                        )
                        setShowStaffForm(true)
                      }}
                    >
                      Edit Staff
                    </button>

                    <hr />
                  </div>
                ))
            )}

            <button
              onClick={() => {
                resetStaffForm()
                setShowStaffForm(true)
              }}
            >
              Add Staff
            </button>

            {showStaffForm && (
              <div>
                <h4>
                  {editingStaffIndex !== null
                    ? "Edit Staff"
                    : "Add Staff"}
                </h4>

                <input
                  type="text"
                  placeholder="Staff Name"
                  value={staffName}
                  onChange={(e) =>
                    setStaffName(e.target.value)
                  }
                />

                <br />
                <br />

                <input
                  type="password"
                  placeholder="Password"
                  value={staffPassword}
                  onChange={(e) =>
                    setStaffPassword(e.target.value)
                  }
                />

                <br />
                <br />

                <select
                  value={staffRole}
                  onChange={(e) =>
                    setStaffRole(e.target.value)
                  }
                >
                  <option value="Operator">
                    Operator
                  </option>
                  <option value="Manager">
                    Manager
                  </option>
                  <option value="Therapist">
                    Therapist
                  </option>
                </select>

                <br />
                <br />

                <p>
                  Status: {staffStatus}
                </p>

                <button
                  onClick={() =>
                    setStaffStatus(
                      staffStatus === "Active"
                        ? "Inactive"
                        : "Active"
                    )
                  }
                >
                  {staffStatus === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <br />
                <br />

                <button
                  onClick={() => {
                    if (
                      !staffName ||
                      !staffPassword
                    ) {
                      alert(
                        "Please complete all staff details."
                      )
                      return
                    }

                    if (
                      editingStaffIndex !== null
                    ) {
                      const updatedStaff = [
                        ...staff,
                      ]

                      updatedStaff[
                        editingStaffIndex
                      ] = {
                        ...updatedStaff[
                          editingStaffIndex
                        ],
                        name: staffName,
                        password: staffPassword,
                        role: staffRole,
                        status: staffStatus,
                      }

                      setStaff(updatedStaff)
                    } else {
                      const newUserId =
                        `SA${String(
                          nextStaffNumber
                        ).padStart(3, "0")}`

                      const newStaff = {
                        clinicId,
                        userId: newUserId,
                        name: staffName,
                        password: staffPassword,
                        role: staffRole,
                        status: "Active",
                      }

                      setStaff((current) => [
                        ...current,
                        newStaff,
                      ])

                      setNextStaffNumber(
                        (current) => current + 1
                      )
                    }

                    resetStaffForm()
                  }}
                >
                  {editingStaffIndex !== null
                    ? "Update Staff"
                    : "Save Staff"}
                </button>{" "}

                <button onClick={resetStaffForm}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

      {/* ======================================================
          TREATMENTS
      ====================================================== */}

      {activeSection === "Treatments" &&
        (currentUser?.role === "Admin" ||
          currentUser?.role === "Manager") && (
          <div>
            <h3>Treatment Management</h3>

            {treatments
              .filter(
                (item) =>
                  item.clinicId === clinicId
              )
              .map((item) => (
                <div key={item.treatmentId}>
                  <strong>{item.name}</strong>

                  <p>
                    Treatment ID:{" "}
                    {item.treatmentId}
                  </p>

                  <p>
                    Duration:{" "}
                    {item.duration} minutes
                  </p>

                  <p>
                    Sessions:{" "}
                    {item.sessions}
                  </p>

                  <p>
                    Default Package Price:{" "}
                    {Number(
                      item.price || 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    Status: {item.status}
                  </p>

                  <button
                    onClick={() => {
                      setTreatments((current) =>
                        current.map(
                          (treatmentItem) =>
                            treatmentItem.treatmentId ===
                            item.treatmentId
                              ? {
                                  ...treatmentItem,
                                  status:
                                    treatmentItem.status ===
                                    "Active"
                                      ? "Inactive"
                                      : "Active",
                                }
                              : treatmentItem
                        )
                      )
                    }}
                  >
                    {item.status === "Active"
                      ? "Disable Treatment"
                      : "Activate Treatment"}
                  </button>{" "}

                  <button
                    onClick={() => {
                      const index =
                        treatments.findIndex(
                          (treatmentItem) =>
                            treatmentItem.treatmentId ===
                            item.treatmentId
                        )

                      setEditingTreatmentIndex(index)
                      setTreatmentName(item.name)
                      setTreatmentDuration(
                        item.duration
                      )
                      setTreatmentSessions(
                        item.sessions
                      )
                      setTreatmentPrice(
                        item.price || 0
                      )
                      setTreatmentStatus(
                        item.status
                      )
                      setShowTreatmentForm(true)
                    }}
                  >
                    Edit Treatment
                  </button>

                  <hr />
                </div>
              ))}

            <button
              onClick={() => {
                resetTreatmentForm()
                setShowTreatmentForm(true)
              }}
            >
              Add Treatment
            </button>

            {showTreatmentForm && (
              <div>
                <h4>
                  {editingTreatmentIndex !== null
                    ? "Edit Treatment"
                    : "Add Treatment"}
                </h4>

                <input
                  type="text"
                  placeholder="Treatment Name"
                  value={treatmentName}
                  onChange={(e) =>
                    setTreatmentName(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <input
                  type="number"
                  min="1"
                  placeholder="Duration in minutes"
                  value={treatmentDuration}
                  onChange={(e) =>
                    setTreatmentDuration(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <input
                  type="number"
                  min="1"
                  placeholder="Number of Sessions"
                  value={treatmentSessions}
                  onChange={(e) =>
                    setTreatmentSessions(
                      Number(e.target.value)
                    )
                  }
                />

                <br />
                <br />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Default Package Price"
                  value={treatmentPrice}
                  onChange={(e) =>
                    setTreatmentPrice(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <p>
                  Status: {treatmentStatus}
                </p>

                <button
                  onClick={() =>
                    setTreatmentStatus(
                      treatmentStatus ===
                        "Active"
                        ? "Inactive"
                        : "Active"
                    )
                  }
                >
                  {treatmentStatus ===
                  "Active"
                    ? "Deactivate Treatment"
                    : "Activate Treatment"}
                </button>

                <br />
                <br />

                <button
                  onClick={() => {
                    if (
                      !treatmentName ||
                      !treatmentDuration ||
                      !treatmentSessions
                    ) {
                      alert(
                        "Please complete all treatment details."
                      )
                      return
                    }

                    const numericPrice =
                      Number(
                        treatmentPrice || 0
                      )

                    if (numericPrice < 0) {
                      alert(
                        "Treatment price cannot be negative."
                      )
                      return
                    }

                    if (
                      editingTreatmentIndex !==
                      null
                    ) {
                      const updatedTreatments = [
                        ...treatments,
                      ]

                      updatedTreatments[
                        editingTreatmentIndex
                      ] = {
                        ...updatedTreatments[
                          editingTreatmentIndex
                        ],
                        name:
                          treatmentName,
                        duration:
                          Number(
                            treatmentDuration
                          ),
                        sessions:
                          Number(
                            treatmentSessions
                          ),
                        price:
                          numericPrice,
                        status:
                          treatmentStatus,
                      }

                      setTreatments(
                        updatedTreatments
                      )
                    } else {
                      const newTreatmentId =
                        `TR${String(
                          nextTreatmentNumber
                        ).padStart(3, "0")}`

                      const newTreatment = {
                        clinicId,
                        treatmentId:
                          newTreatmentId,
                        name:
                          treatmentName,
                        duration:
                          Number(
                            treatmentDuration
                          ),
                        sessions:
                          Number(
                            treatmentSessions
                          ),
                        price:
                          numericPrice,
                        status:
                          treatmentStatus,
                      }

                      setTreatments((current) => [
                        ...current,
                        newTreatment,
                      ])

                      setNextTreatmentNumber(
                        (current) =>
                          current + 1
                      )
                    }

                    resetTreatmentForm()
                  }}
                >
                  {editingTreatmentIndex !==
                  null
                    ? "Update Treatment"
                    : "Save Treatment"}
                </button>{" "}

                <button
                  onClick={
                    resetTreatmentForm
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

      {/* ======================================================
          ROOMS
      ====================================================== */}

      {activeSection === "Rooms" &&
        (currentUser?.role === "Admin" ||
          currentUser?.role === "Manager") && (
          <div>
            <h3>Room Management</h3>

            {rooms
              .filter(
                (room) =>
                  room.clinicId === clinicId
              )
              .map((room) => (
                <div key={room.roomId}>
                  <strong>{room.name}</strong>

                  <p>
                    Room ID: {room.roomId}
                  </p>

                  <p>
                    Status: {room.status}
                  </p>

                  <button
                    onClick={() => {
                      setRooms((current) =>
                        current.map(
                          (roomItem) =>
                            roomItem.roomId ===
                            room.roomId
                              ? {
                                  ...roomItem,
                                  status:
                                    roomItem.status ===
                                    "Active"
                                      ? "Inactive"
                                      : "Active",
                                }
                              : roomItem
                        )
                      )
                    }}
                  >
                    {room.status === "Active"
                      ? "Disable Room"
                      : "Activate Room"}
                  </button>{" "}

                  <button
                    onClick={() => {
                      setEditingRoomId(
                        room.roomId
                      )
                      setRoomName(
                        room.name
                      )
                      setRoomStatus(
                        room.status
                      )
                      setShowRoomForm(true)
                    }}
                  >
                    Edit Room
                  </button>

                  <hr />
                </div>
              ))}

            <button
              onClick={() => {
                resetRoomForm()
                setShowRoomForm(true)
              }}
            >
              Add Room
            </button>

            {showRoomForm && (
              <div>
                <h4>
                  {editingRoomId !== null
                    ? "Edit Room"
                    : "Add Room"}
                </h4>

                <input
                  type="text"
                  placeholder="Room Name"
                  value={roomName}
                  onChange={(e) =>
                    setRoomName(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <p>
                  Status: {roomStatus}
                </p>

                <button
                  onClick={() =>
                    setRoomStatus(
                      roomStatus === "Active"
                        ? "Inactive"
                        : "Active"
                    )
                  }
                >
                  {roomStatus === "Active"
                    ? "Disable Room"
                    : "Activate Room"}
                </button>

                <br />
                <br />

                <button
                  onClick={() => {
                    if (!roomName) {
                      alert(
                        "Please enter a room name."
                      )
                      return
                    }

                    if (
                      editingRoomId !== null
                    ) {
                      setRooms((current) =>
                        current.map(
                          (room) =>
                            room.roomId ===
                            editingRoomId
                              ? {
                                  ...room,
                                  name:
                                    roomName,
                                  status:
                                    roomStatus,
                                }
                              : room
                        )
                      )
                    } else {
                      const numbers =
                        rooms
                          .filter(
                            (room) =>
                              room.clinicId ===
                              clinicId
                          )
                          .map((room) => {
                            const match =
                              room.roomId.match(
                                /^RM(\d+)$/
                              )

                            return match
                              ? Number(
                                  match[1]
                                )
                              : 0
                          })

                      const nextNumber =
                        numbers.length
                          ? Math.max(
                              ...numbers
                            ) + 1
                          : 1

                      const newRoom = {
                        clinicId,
                        roomId:
                          `RM${String(
                            nextNumber
                          ).padStart(3, "0")}`,
                        name:
                          roomName,
                        status:
                          roomStatus,
                      }

                      setRooms((current) => [
                        ...current,
                        newRoom,
                      ])
                    }

                    resetRoomForm()
                  }}
                >
                  {editingRoomId !== null
                    ? "Update Room"
                    : "Save Room"}
                </button>{" "}

                <button
                  onClick={
                    resetRoomForm
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

      {/* ======================================================
          CLINIC
      ====================================================== */}

      {activeSection === "Clinic" &&
        currentUser?.role === "Admin" && (
          <div>
            <h3>Clinic Settings</h3>

            <p>
              Clinic ID:{" "}
              <strong>
                {clinic.clinicId}
              </strong>
            </p>

            <p>
              Clinic Name:{" "}
              <strong>
                {clinic.name}
              </strong>
            </p>

            <p>
              Phone:{" "}
              {clinic.phone || "Not set"}
            </p>

            <p>
              Address:{" "}
              {clinic.address || "Not set"}
            </p>

            <p>
              Opening Time:{" "}
              {clinic.openingTime}
            </p>

            <p>
              Closing Time:{" "}
              {clinic.closingTime}
            </p>

            <button
              onClick={() => {
                setClinicName(clinic.name)
                setClinicPhone(clinic.phone)
                setClinicAddress(clinic.address)
                setClinicOpeningTime(
                  clinic.openingTime
                )
                setClinicClosingTime(
                  clinic.closingTime
                )
                setShowClinicForm(true)
              }}
            >
              Edit Clinic
            </button>

            {showClinicForm && (
              <div>
                <h4>Edit Clinic</h4>

                <input
                  type="text"
                  placeholder="Clinic Name"
                  value={clinicName}
                  onChange={(e) =>
                    setClinicName(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <input
                  type="text"
                  placeholder="Clinic Phone"
                  value={clinicPhone}
                  onChange={(e) =>
                    setClinicPhone(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <input
                  type="text"
                  placeholder="Clinic Address"
                  value={clinicAddress}
                  onChange={(e) =>
                    setClinicAddress(
                      e.target.value
                    )
                  }
                />

                <br />
                <br />

                <label>
                  Opening Time:{" "}
                  <input
                    type="time"
                    value={clinicOpeningTime}
                    onChange={(e) =>
                      setClinicOpeningTime(
                        e.target.value
                      )
                    }
                  />
                </label>

                <br />
                <br />

                <label>
                  Closing Time:{" "}
                  <input
                    type="time"
                    value={clinicClosingTime}
                    onChange={(e) =>
                      setClinicClosingTime(
                        e.target.value
                      )
                    }
                  />
                </label>

                <br />
                <br />

                <button
                  onClick={() => {
                    if (
                      !clinicName ||
                      !clinicOpeningTime ||
                      !clinicClosingTime
                    ) {
                      alert(
                        "Please complete the required clinic details."
                      )
                      return
                    }

                    setClinic((current) => ({
                      ...current,
                      name: clinicName,
                      phone: clinicPhone,
                      address: clinicAddress,
                      openingTime:
                        clinicOpeningTime,
                      closingTime:
                        clinicClosingTime,
                    }))

                    setShowClinicForm(false)
                  }}
                >
                  Save Clinic
                </button>{" "}

                <button
                  onClick={() =>
                    setShowClinicForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  )
}

export default App
