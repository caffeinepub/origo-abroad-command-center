import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type LeadStage = {
    #inquiry;
    #applied;
    #visa;
    #enrolled;
  };

  type Campaign = {
    id : Nat;
    name : Text;
    platform : Text;
    budget : Nat;
    startDate : Text;
    endDate : Text;
    reach : Nat;
    engagement : Nat;
    status : Text; // planned, active, completed
  };

  type StudentLead = {
    id : Nat;
    name : Text;
    email : Text;
    budget : Nat;
    stage : LeadStage;
    source : Text;
    assignedTo : Principal;
    createdAt : Time.Time;
    notes : Text;
  };

  type SocialPost = {
    id : Nat;
    platform : Text;
    contentPillar : Text;
    publishDate : Time.Time;
    reach : Nat;
    engagement : Nat;
    campaignName : Text;
  };

  type Task = {
    id : Nat;
    title : Text;
    priority : Text;
    dueDate : Time.Time;
    status : Text;
    assignedTo : Principal;
  };

  type UserProfile = {
    userId : Principal;
    fullName : Text;
    role : Text;
  };

  module StudentLead {
    public func compare(lead1 : StudentLead, lead2 : StudentLead) : Order.Order {
      Nat.compare(lead1.id, lead2.id);
    };
  };

  module SocialPost {
    public func compare(post1 : SocialPost, post2 : SocialPost) : Order.Order {
      Nat.compare(post1.id, post2.id);
    };
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Principal.compare(profile1.userId, profile2.userId);
    };
  };

  var nextStudentLeadId = 0;
  var nextSocialPostId = 0;
  var nextTaskId = 0;
  var nextCampaignId = 0;

  // Data storage
  let campaigns = Map.empty<Nat, Campaign>();
  let studentLeads = Map.empty<Nat, StudentLead>();
  let socialPosts = Map.empty<Nat, SocialPost>();
  let tasks = Map.empty<Nat, Task>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let newProfile : UserProfile = {
      profile with
      userId = caller;
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async UserProfile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User does not exist!") };
      case (?profile) { profile };
    };
  };

  // Student Lead Management
  public query ({ caller }) func getLead(id : Nat) : async StudentLead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };
    switch (studentLeads.get(id)) {
      case (null) { Runtime.trap("Lead does not exist!") };
      case (?lead) { lead };
    };
  };

  public query ({ caller }) func getAllLeads() : async [StudentLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };
    studentLeads.values().toArray().sort();
  };

  public query ({ caller }) func getLeadsByStage(stage : LeadStage) : async [StudentLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };
    let allLeads = studentLeads.values().toArray();
    allLeads.filter(func(lead : StudentLead) : Bool { lead.stage == stage });
  };

  public query ({ caller }) func getLeadsAssignedToUser(userId : Principal) : async [StudentLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };
    let allLeads = studentLeads.values().toArray();
    allLeads.filter(func(lead : StudentLead) : Bool { lead.assignedTo == userId });
  };

  public shared ({ caller }) func createLead(lead : StudentLead) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create leads");
    };

    let id = nextStudentLeadId;
    nextStudentLeadId += 1;
    let newLead : StudentLead = {
      lead with
      id;
      createdAt = Time.now();
      assignedTo = caller;
    };
    studentLeads.add(id, newLead);
    id;
  };

  public shared ({ caller }) func updateStudentLead(id : Nat, input : StudentLead) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update leads");
    };
    let existingEntry = studentLeads.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        // Only assigned user or admin can update
        if (value.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update leads assigned to you");
        };
        studentLeads.add(
          id,
          {
            value with
            name = input.name;
            email = input.email;
            budget = input.budget;
            stage = input.stage;
            source = input.source;
            notes = input.notes;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteStudentLead(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete leads");
    };
    let existingEntry = studentLeads.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        // Only assigned user or admin can delete
        if (value.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete leads assigned to you");
        };
        ignore studentLeads.remove(id);
      };
    };
  };

  // Social Post Management
  public query ({ caller }) func getPost(id : Nat) : async SocialPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    switch (socialPosts.get(id)) {
      case (null) { Runtime.trap("Post does not exist!") };
      case (?post) { post };
    };
  };

  public query ({ caller }) func getAllPosts() : async [SocialPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    socialPosts.values().toArray().sort();
  };

  public shared ({ caller }) func createPost(post : SocialPost) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let id = nextSocialPostId;
    nextSocialPostId += 1;
    let newPost : SocialPost = {
      post with
      id;
      publishDate = Time.now();
    };
    socialPosts.add(id, newPost);
    id;
  };

  public shared ({ caller }) func updateSocialPost(id : Nat, input : SocialPost) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update posts");
    };
    let existingEntry = socialPosts.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        socialPosts.add(
          id,
          {
            value with
            platform = input.platform;
            contentPillar = input.contentPillar;
            reach = input.reach;
            engagement = input.engagement;
            campaignName = input.campaignName;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteSocialPost(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };
    switch (socialPosts.get(id)) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?_) {
        ignore socialPosts.remove(id);
      };
    };
  };

  // Campaign Management
  public query ({ caller }) func getCampaign(id : Nat) : async ?Campaign {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view campaigns");
    };
    campaigns.get(id);
  };

  public query ({ caller }) func getAllCampaigns() : async [Campaign] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view campaigns");
    };
    campaigns.values().toArray();
  };

  public shared ({ caller }) func createCampaign(newCampaign : Campaign) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create campaigns");
    };

    let id = nextCampaignId;
    nextCampaignId += 1;
    let campaign : Campaign = { newCampaign with id };
    campaigns.add(id, campaign);
    id;
  };

  public shared ({ caller }) func updateCampaign(id : Nat, input : Campaign) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update campaigns");
    };
    let existingEntry = campaigns.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        campaigns.add(
          id,
          {
            value with
            name = input.name;
            platform = input.platform;
            budget = input.budget;
            startDate = input.startDate;
            endDate = input.endDate;
            reach = input.reach;
            engagement = input.engagement;
            status = input.status;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteCampaign(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete campaigns");
    };
    switch (campaigns.get(id)) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?_) {
        ignore campaigns.remove(id);
      };
    };
  };

  // Task Management
  public query ({ caller }) func getTask(id : Nat) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task does not exist!") };
      case (?task) { task };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.values().toArray().sort();
  };

  public query ({ caller }) func getTasksAssignedToUser(userId : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    let allTasks = tasks.values().toArray();
    allTasks.filter(func(task : Task) : Bool { task.assignedTo == userId });
  };

  public shared ({ caller }) func createTask(task : Task) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let id = nextTaskId;
    nextTaskId += 1;
    let newTask : Task = {
      task with
      id;
      dueDate = Time.now();
      assignedTo = caller;
    };
    tasks.add(id, newTask);
    id;
  };

  public shared ({ caller }) func updateTask(id : Nat, input : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    let existingEntry = tasks.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        // Only assigned user or admin can update
        if (value.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update tasks assigned to you");
        };
        tasks.add(
          id,
          {
            value with
            title = input.title;
            status = input.status;
            priority = input.priority;
            dueDate = input.dueDate;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    let existingEntry = tasks.get(id);
    switch (existingEntry) {
      case (null) { Runtime.trap("Entry does not exist!") };
      case (?value) {
        // Only assigned user or admin can delete
        if (value.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete tasks assigned to you");
        };
        ignore tasks.remove(id);
      };
    };
  };

  // KPI Methods
  public query ({ caller }) func countActiveLeads() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KPIs");
    };
    let leads = studentLeads.values().toArray();
    var activeLeads = 0;
    for (lead in leads.values()) {
      switch (lead.stage) {
        case (#enrolled) {};
        case (_) { activeLeads += 1 };
      };
    };
    activeLeads;
  };

  public query ({ caller }) func getTotalReach() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KPIs");
    };
    socialPosts.values().toArray().foldLeft(0, func(acc, post) { acc + post.reach });
  };

  public query ({ caller }) func getTotalEngagement() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KPIs");
    };
    socialPosts.values().toArray().foldLeft(0, func(acc, post) { acc + post.engagement });
  };

  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.values().toArray().sort();
  };

  public type TaskInput = {
    title : Text;
    priority : Text;
    dueDate : Text;
    status : Text;
    assignedTo : Text;
  };
};
